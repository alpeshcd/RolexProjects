"""Real Mastan exchange API feed.

Activated by setting EXCHANGE_PROVIDER=mastan in the backend .env file.
Also requires EXCHANGE_API_KEY and EXCHANGE_API_URL.

The shapes returned here MUST match the shapes MockFeed returns — same keys,
same nesting — so the Mastan portal frontend never needs to change.
"""
import logging
from typing import Optional

import httpx

from app.core.config import settings
from app.services.exchange.feed import MarketFeed

logger = logging.getLogger(__name__)


class MastanFeed(MarketFeed):
    """Thin wrapper around the Mastan exchange REST API."""

    def __init__(self) -> None:
        self.base = (settings.EXCHANGE_API_URL or "").rstrip("/")
        self.key = settings.EXCHANGE_API_KEY or ""
        if not self.base or not self.key:
            raise RuntimeError(
                "EXCHANGE_API_URL and EXCHANGE_API_KEY must be set when "
                "EXCHANGE_PROVIDER=mastan"
            )
        self.headers = {
            "X-Api-Key": self.key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _get(self, path: str, params: dict | None = None) -> dict | list:
        url = f"{self.base}{path}"
        try:
            resp = httpx.get(url, headers=self.headers, params=params or {}, timeout=10)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as exc:
            logger.error("Mastan API %s returned %s: %s", url, exc.response.status_code, exc.response.text[:200])
            raise
        except Exception as exc:
            logger.error("Mastan API %s failed: %s", url, exc)
            raise

    # ---- MarketFeed interface -----------------------------------------------

    def sports(self) -> list[dict]:
        """Returns: [{id, name, event_count, inplay_count}, ...]"""
        return self._get("/sports")  # type: ignore[return-value]

    def events(self, sport_id: Optional[int] = None, inplay_only: bool = False) -> list[dict]:
        """Returns: [event, ...] where each event has event_id, sport_id, name,
        competition, open_date, inplay, badges, exposure, odds.
        """
        params: dict = {}
        if sport_id is not None:
            params["sport_id"] = sport_id
        if inplay_only:
            params["inplay"] = "true"
        return self._get("/events", params)  # type: ignore[return-value]

    def event(self, event_id: int) -> Optional[dict]:
        """Returns event detail with markets (match_odds, bookmaker, fancy, last_digit)."""
        try:
            return self._get(f"/events/{event_id}")  # type: ignore[return-value]
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                return None
            raise

    def bets(self, domain_key: str, event_id: Optional[int] = None) -> list[dict]:
        """Returns: [{client, runner, rate, run, stake, pl, placed_at, market}, ...]"""
        params: dict = {"domain": domain_key}
        if event_id is not None:
            params["event_id"] = event_id
        return self._get("/bets", params)  # type: ignore[return-value]

    def news(self, brand_name: str) -> list[str]:
        """Returns a list of news strings for the ticker."""
        try:
            return self._get("/news", {"brand": brand_name})  # type: ignore[return-value]
        except Exception:
            return []
