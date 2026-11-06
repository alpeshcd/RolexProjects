"""Inbound side of the casino integration: Operator (us) -> Platform (client).

Three calls, all authenticated with an opaque bearer token we fetch ourselves:

    POST   /auth/token    exchange username+password for a token (6h validity)
    DELETE /auth/token    revoke it
    GET    /games         the active game list (meant to be polled once or
                          twice a day, so it is cached here)
    POST   /launch-url    create/refresh the player on the platform and get
                          the URL the player opens in an iframe or new tab

Activated by setting CASINO_PROVIDER=live together with CASINO_API_URL,
CASINO_API_USERNAME and CASINO_API_PASSWORD in the backend .env file.

The token is kept in memory and refreshed an hour before it expires, which is
what the spec asks for ("default validity is 6 hours, you may schedule to
fetch this token every 5 hours").
"""
import logging
import threading
from datetime import datetime, timedelta
from typing import Any, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Refresh this long before the token actually expires
TOKEN_REFRESH_MARGIN = timedelta(hours=1)


class CasinoPlatformError(RuntimeError):
    """An upstream call failed. `code` is the platform's error code when it sent one."""

    def __init__(self, message: str, code: str = "UNKNOWN_ERROR", status: Optional[int] = None):
        super().__init__(message)
        self.code = code
        self.status = status


class PlatformClient:
    """Thin, thread-safe wrapper around the platform's Operator API."""

    def __init__(self) -> None:
        self.base = (settings.CASINO_API_URL or "").rstrip("/")
        self.username = settings.CASINO_API_USERNAME or ""
        self.password = settings.CASINO_API_PASSWORD or ""
        self.timeout = settings.CASINO_API_TIMEOUT

        self._lock = threading.Lock()
        self._token: Optional[str] = None
        self._token_expires: Optional[datetime] = None
        self._games: list[dict] = []
        self._games_fetched: Optional[datetime] = None
        self.last_error: Optional[str] = None

    # ---- configuration -------------------------------------------------

    @property
    def configured(self) -> bool:
        return bool(self.base and self.username and self.password)

    def _require_config(self) -> None:
        if not self.configured:
            raise CasinoPlatformError(
                "CASINO_API_URL, CASINO_API_USERNAME and CASINO_API_PASSWORD must be "
                "set when CASINO_PROVIDER=live",
                code="REQUEST_DECLINED",
            )

    # ---- token ---------------------------------------------------------

    @property
    def token_valid_until(self) -> Optional[datetime]:
        return self._token_expires

    def _fetch_token(self) -> str:
        self._require_config()
        url = f"{self.base}/auth/token"
        try:
            resp = httpx.post(
                url,
                json={"username": self.username, "password": self.password},
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                timeout=self.timeout,
            )
        except Exception as exc:  # transport error
            raise CasinoPlatformError(f"Casino platform unreachable: {exc}") from exc

        if resp.status_code != 200:
            code, message = _error_of(resp)
            raise CasinoPlatformError(
                f"Casino token request failed ({resp.status_code}): {message}",
                code=code,
                status=resp.status_code,
            )

        data = resp.json()
        token = data.get("access_token")
        if not token:
            raise CasinoPlatformError("Casino platform returned no access_token")
        # expires_in is in MILLISECONDS (spec note), not seconds
        expires_ms = data.get("expires_in") or 0
        try:
            expires_ms = int(expires_ms)
        except (TypeError, ValueError):
            expires_ms = 0
        lifetime = timedelta(milliseconds=expires_ms) if expires_ms > 0 else timedelta(hours=6)

        self._token = token
        self._token_expires = datetime.utcnow() + lifetime
        logger.info("Casino platform token issued, valid until %s UTC", self._token_expires)
        return token

    def token(self, force: bool = False) -> str:
        """A live bearer token, fetching or refreshing it when needed."""
        with self._lock:
            fresh = (
                self._token
                and self._token_expires
                and datetime.utcnow() < self._token_expires - TOKEN_REFRESH_MARGIN
            )
            if fresh and not force:
                return self._token  # type: ignore[return-value]
            return self._fetch_token()

    def revoke_token(self) -> bool:
        """DELETE /auth/token. Returns True when the platform accepted it."""
        with self._lock:
            token = self._token
            self._token = None
            self._token_expires = None
        if not token:
            return False
        try:
            resp = httpx.request(
                "DELETE",
                f"{self.base}/auth/token",
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                timeout=self.timeout,
            )
            return resp.status_code in (200, 204)
        except Exception as exc:
            logger.warning("Casino token revoke failed: %s", exc)
            return False

    # ---- requests ------------------------------------------------------

    def _request(self, method: str, path: str, *, json_body: Any = None, retry_auth: bool = True) -> Any:
        self._require_config()
        url = f"{self.base}{path}"
        headers = {
            "Authorization": f"Bearer {self.token()}",
            "Accept": "application/json",
        }
        if json_body is not None:
            headers["Content-Type"] = "application/json"

        try:
            resp = httpx.request(method, url, headers=headers, json=json_body, timeout=self.timeout)
        except Exception as exc:
            self.last_error = str(exc)
            raise CasinoPlatformError(f"Casino platform unreachable: {exc}") from exc

        # A rejected token means our cached one died early: get a new one once.
        if resp.status_code == 401 and retry_auth:
            logger.info("Casino platform rejected our token, re-issuing")
            self.token(force=True)
            return self._request(method, path, json_body=json_body, retry_auth=False)

        if resp.status_code >= 400:
            code, message = _error_of(resp)
            self.last_error = f"{code}: {message}"
            raise CasinoPlatformError(
                f"Casino {method} {path} failed ({resp.status_code}): {message}",
                code=code,
                status=resp.status_code,
            )

        self.last_error = None
        if resp.status_code == 204 or not resp.content:
            return None
        return resp.json()

    # ---- endpoints -----------------------------------------------------

    def games(self, refresh: bool = False) -> list[dict]:
        """GET /games, cached for CASINO_GAMES_CACHE_HOURS.

        On a failed refresh the previous list is kept and served, so a brief
        platform outage does not empty the player site's casino page.
        """
        ttl = timedelta(hours=max(1, settings.CASINO_GAMES_CACHE_HOURS))
        fresh = self._games_fetched and datetime.utcnow() - self._games_fetched < ttl
        if self._games and fresh and not refresh:
            return self._games

        try:
            data = self._request("GET", "/games")
        except CasinoPlatformError:
            if self._games:
                logger.warning("Casino games refresh failed, serving the cached list")
                return self._games
            raise

        games = (data or {}).get("games") if isinstance(data, dict) else data
        self._games = list(games or [])
        self._games_fetched = datetime.utcnow()
        logger.info("Casino games list refreshed: %d games", len(self._games))
        return self._games

    def launch_url(
        self,
        *,
        player_id: str,
        name: str,
        currency: Optional[str] = None,
        country: Optional[str] = None,
        lang: Optional[str] = None,
        return_url: Optional[str] = None,
        player_session_token: Optional[str] = None,
        game_id: Optional[int] = None,
        bet_limit: Optional[dict] = None,
        jurisdiction: Optional[str] = None,
        gender: Optional[str] = None,
        birth_date: Optional[str] = None,
    ) -> dict:
        """POST /launch-url. Returns {"url": ..., "player_session_token": ...}.

        The platform creates the player on the fly and never updates one that
        already exists, so the currency a player is first created with is the
        currency they keep.
        """
        body: dict[str, Any] = {
            "player_id": player_id[:36],
            "name": (name or player_id)[:50],
            "currency": (currency or settings.CASINO_CURRENCY).upper()[:3],
            "country": (country or settings.CASINO_COUNTRY).upper()[:2],
            "lang": lang or settings.CASINO_LANG,
            "return_url": return_url or settings.CASINO_RETURN_URL,
        }
        if player_session_token:
            body["player_session_token"] = player_session_token
        if game_id is not None:
            body["game_id"] = game_id
        if bet_limit:
            body["bet_limit"] = bet_limit
        if jurisdiction:
            body["jurisdiction"] = jurisdiction
        if gender:
            body["gender"] = gender
        if birth_date:
            body["birth_date"] = birth_date

        data = self._request("POST", "/launch-url", json_body=body)
        if not isinstance(data, dict) or not data.get("url"):
            raise CasinoPlatformError("Casino platform returned no launch url")
        return data


def _error_of(resp: "httpx.Response") -> tuple[str, str]:
    """The platform's error code and message out of an error response."""
    try:
        data = resp.json()
    except Exception:
        return "UNKNOWN_ERROR", (resp.text or "")[:300]
    if not isinstance(data, dict):
        return "UNKNOWN_ERROR", str(data)[:300]
    code = str(data.get("code") or "UNKNOWN_ERROR")
    message = str(data.get("message") or resp.text or "")[:300]
    errors = data.get("errors")
    if errors:
        message = f"{message} {errors}"[:400]
    return code, message


_client: Optional[PlatformClient] = None
_client_lock = threading.Lock()


def get_platform() -> PlatformClient:
    """The shared platform client (one token cache per process)."""
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:
                _client = PlatformClient()
    return _client
