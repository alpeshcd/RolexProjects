"""Betfair Exchange API feed.

Activated by setting EXCHANGE_PROVIDER=betfair in the backend .env file.
Also requires BETFAIR_USERNAME, BETFAIR_PASSWORD, and BETFAIR_APP_KEY.

Authentication flow:
  1. POST username + password to identitysso.betfair.com → get session token
  2. Use session token + app key in X-Authentication / X-Application headers
  3. Auto-refresh token when it expires

The shapes returned here MUST match the shapes MockFeed returns — same keys,
same nesting — so the Mastan portal frontend never needs to change.
"""
import logging
import time
from datetime import datetime, timezone
from typing import Optional

import httpx

from app.core.config import settings
from app.services.exchange.feed import MarketFeed
from app.services.exchange.mock_feed import MockFeed

logger = logging.getLogger(__name__)

# ── Betfair endpoints (fixed, no need for client to provide) ─────────────
LOGIN_URL = "https://identitysso.betfair.com/api/login"
KEEPALIVE_URL = "https://identitysso.betfair.com/api/keepAlive"
API_URL = "https://api.betfair.com/exchange/betting/json-rpc/v1"

# Session token lifetime: refresh every 3 hours (Betfair tokens last ~4-8h)
TOKEN_REFRESH_SECONDS = 3 * 3600

# Betfair sport IDs (eventTypeIds)
BETFAIR_SPORT_IDS = {
    "1": "Football",
    "2": "Tennis",
    "4": "Cricket",
    "7": "Horse Racing",
    "4339": "Greyhound Racing",
    "7522": "Basketball",
    "7511": "Baseball",
}


class BetfairFeed(MarketFeed):
    """Connects to the Betfair Exchange API for live market data, with automatic mock fallback on geo-restriction/errors."""

    def __init__(self) -> None:
        self.username = settings.BETFAIR_USERNAME
        self.password = settings.BETFAIR_PASSWORD
        self.app_key = settings.BETFAIR_APP_KEY
        self.proxy = settings.BETFAIR_PROXY or None
        self._mock = MockFeed()

        if not self.username or not self.password or not self.app_key:
            raise RuntimeError(
                "BETFAIR_USERNAME, BETFAIR_PASSWORD, and BETFAIR_APP_KEY must "
                "be set when EXCHANGE_PROVIDER=betfair"
            )

        self._session_token: str = ""
        self._token_obtained_at: float = 0

    def _client(self) -> httpx.Client:
        """Create httpx Client with optional proxy support."""
        if self.proxy:
            return httpx.Client(proxy=self.proxy, timeout=15.0)
        return httpx.Client(timeout=15.0)

    # ── Authentication ───────────────────────────────────────────────────

    def _login(self) -> str:
        """Authenticate with Betfair and return a session token."""
        headers = {
            "X-Application": self.app_key,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        }
        data = {
            "username": self.username,
            "password": self.password,
        }
        try:
            with self._client() as client:
                resp = client.post(LOGIN_URL, headers=headers, data=data)
                if resp.status_code == 403 and "Restricted" in resp.text:
                    raise RuntimeError(
                        "Betfair API is geo-restricted from your current IP (India). "
                        "Betfair requires access from an allowed region (e.g. UK/EU). "
                        "Please use a VPN or configure BETFAIR_PROXY in .env (e.g. http://proxy-host:port)."
                    )
                resp.raise_for_status()
                body = resp.json()
                if body.get("status") != "SUCCESS":
                    error = body.get("error", "UNKNOWN")
                    raise RuntimeError(f"Betfair login failed: {error}")
                token = body["token"]
                logger.info("Betfair login successful, token obtained")
                return token
        except httpx.HTTPStatusError as exc:
            logger.error("Betfair login HTTP error %s: %s",
                         exc.response.status_code, exc.response.text[:200])
            raise
        except Exception as exc:
            logger.error("Betfair login failed: %s", exc)
            raise

    def _ensure_session(self) -> None:
        """Get or refresh the session token if needed."""
        now = time.time()
        if self._session_token and (now - self._token_obtained_at) < TOKEN_REFRESH_SECONDS:
            return  # Token is still fresh
        self._session_token = self._login()
        self._token_obtained_at = now

    def _api_headers(self) -> dict:
        """Return headers required for Betfair API calls."""
        self._ensure_session()
        return {
            "X-Application": self.app_key,
            "X-Authentication": self._session_token,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    # ── API call helper ──────────────────────────────────────────────────

    def _call(self, method: str, params: dict) -> list | dict:
        """Make a JSON-RPC call to the Betfair API."""
        payload = {
            "jsonrpc": "2.0",
            "method": f"SportsAPING/v1.0/{method}",
            "params": params,
            "id": 1,
        }
        try:
            with self._client() as client:
                resp = client.post(
                    API_URL,
                    headers=self._api_headers(),
                    json=payload,
                )
                resp.raise_for_status()
                body = resp.json()

                if "error" in body:
                    error = body["error"]
                    # Token expired — retry once with fresh login
                    if "INVALID_SESSION" in str(error) or "NO_SESSION" in str(error):
                        logger.warning("Betfair session expired, re-authenticating...")
                        self._session_token = ""
                        resp = client.post(
                            API_URL,
                            headers=self._api_headers(),
                            json=payload,
                        )
                        resp.raise_for_status()
                        body = resp.json()
                        if "error" in body:
                            raise RuntimeError(f"Betfair API error after re-auth: {body['error']}")
                    else:
                        raise RuntimeError(f"Betfair API error: {error}")

                return body.get("result", [])
        except httpx.HTTPStatusError as exc:
            logger.error("Betfair API %s HTTP %s: %s",
                         method, exc.response.status_code, exc.response.text[:200])
            raise
        except Exception as exc:
            logger.error("Betfair API %s failed: %s", method, exc)
            raise

    # ── Data mapping helpers ─────────────────────────────────────────────

    @staticmethod
    def _iso(dt_str: str | None) -> str:
        """Normalize Betfair date string to ISO format."""
        if not dt_str:
            return datetime.now(timezone.utc).isoformat()
        return dt_str

    @staticmethod
    def _map_runner_prices(runner: dict) -> dict:
        """Convert Betfair runner exchange prices to our format."""
        ex = runner.get("ex", {})
        backs = ex.get("availableToBack", [])
        lays = ex.get("availableToLay", [])

        back_prices = [{"price": b["price"], "size": round(b["size"], 2)} for b in backs[:3]]
        lay_prices = [{"price": l["price"], "size": round(l["size"], 2)} for l in lays[:3]]

        return {
            "name": runner.get("runnerName", f"Runner {runner.get('selectionId', '?')}"),
            "selection_id": runner.get("selectionId"),
            "back": back_prices,
            "lay": lay_prices,
        }

    @staticmethod
    def _odds_slot(runner_prices: dict) -> dict | None:
        """Convert runner prices to the simple back/lay slot format for event listing."""
        backs = runner_prices.get("back", [])
        lays = runner_prices.get("lay", [])
        if not backs and not lays:
            return None
        return {
            "back": backs[0] if backs else None,
            "lay": lays[0] if lays else None,
        }

    def _detect_sport_name(self, event_type_id: str) -> str:
        """Map Betfair eventTypeId to a sport name."""
        return BETFAIR_SPORT_IDS.get(event_type_id, f"Sport {event_type_id}")

    # ── MarketFeed interface ─────────────────────────────────────────────

    def sports(self) -> list[dict]:
        """Returns: [{id, name, event_count, inplay_count}, ...]"""
        try:
            result = self._call("listEventTypes", {"filter": {}})
        except Exception:
            logger.warning("Betfair API unavailable or geo-restricted; falling back to mock sports feed.")
            return self._mock.sports()

        sports_list = []
        for item in result:
            et = item.get("eventType", {})
            sport_id = int(et.get("id", 0))
            name = et.get("name", "Unknown")
            count = item.get("marketCount", 0)

            # Get in-play count
            try:
                inplay_result = self._call("listEventTypes", {
                    "filter": {"eventTypeIds": [str(sport_id)], "inPlayOnly": True}
                })
                inplay_count = inplay_result[0].get("marketCount", 0) if inplay_result else 0
            except Exception:
                inplay_count = 0

            sports_list.append({
                "id": sport_id,
                "name": name,
                "event_count": count,
                "inplay_count": inplay_count,
            })

        return sports_list

    def events(self, sport_id: Optional[int] = None, inplay_only: bool = False) -> list[dict]:
        """Returns: [event, ...] with event_id, sport_id, name, odds, etc."""
        try:
            filter_params: dict = {}
            if sport_id is not None:
                filter_params["eventTypeIds"] = [str(sport_id)]
            if inplay_only:
                filter_params["inPlayOnly"] = True

            # Get events
            events_result = self._call("listEvents", {"filter": filter_params})

            events_list = []
            for item in events_result:
                ev = item.get("event", {})
                event_id = int(ev.get("id", 0))
                event_name = ev.get("name", "Unknown")
                open_date = self._iso(ev.get("openDate"))
                country_code = ev.get("countryCode", "")

                # Determine sport info
                event_sport_id = sport_id or 0
                event_sport_name = self._detect_sport_name(str(event_sport_id)) if event_sport_id else "Unknown"

                # Check if in-play by comparing openDate with now
                try:
                    open_dt = datetime.fromisoformat(open_date.replace("Z", "+00:00"))
                    inplay = datetime.now(timezone.utc) >= open_dt
                except Exception:
                    inplay = False

                events_list.append({
                    "event_id": event_id,
                    "sport_id": event_sport_id,
                    "sport_name": event_sport_name,
                    "name": event_name,
                    "competition": country_code,
                    "open_date": open_date,
                    "inplay": inplay,
                    "badges": {
                        "fancy": False,
                        "bookmaker": False,
                        "premium": False,
                        "tv": False,
                    },
                    "exposure": 0,
                    "odds": [None, None, None],
                })

            # Limit events to top 50 to keep response fast
            events_list = events_list[:50]
            target_events = events_list[:25]

            if target_events:
                event_map = {ev["event_id"]: ev for ev in target_events}
                event_ids = [str(ev["event_id"]) for ev in target_events]

                try:
                    markets = self._call("listMarketCatalogue", {
                        "filter": {
                            "eventIds": event_ids,
                            "marketTypeCodes": ["MATCH_ODDS"],
                        },
                        "maxResults": str(len(event_ids)),
                        "marketProjection": ["RUNNER_DESCRIPTION", "COMPETITION", "EVENT", "EVENT_TYPE"],
                    })

                    market_by_event: dict = {}
                    market_ids: list[str] = []
                    for m in markets:
                        eid = int(m.get("event", {}).get("id", 0))
                        mid = m.get("marketId")
                        if eid and mid and eid not in market_by_event:
                            market_by_event[eid] = m
                            market_ids.append(mid)

                    books_by_mid: dict = {}
                    if market_ids:
                        books = self._call("listMarketBook", {
                            "marketIds": market_ids,
                            "priceProjection": {
                                "priceData": ["EX_BEST_OFFERS"],
                                "exBestOffersOverrides": {"bestPricesDepth": 3},
                            },
                        })
                        for b in books:
                            books_by_mid[b.get("marketId")] = b

                    for eid, m in market_by_event.items():
                        ev = event_map.get(eid)
                        if not ev:
                            continue

                        comp = m.get("competition", {})
                        if comp:
                            ev["competition"] = comp.get("name", ev["competition"])

                        event_type = m.get("eventType", {})
                        if event_type:
                            ev["sport_id"] = int(event_type.get("id", ev["sport_id"]))
                            ev["sport_name"] = event_type.get("name", ev["sport_name"])

                        book = books_by_mid.get(m.get("marketId"))
                        if book:
                            ev["inplay"] = book.get("inplay", ev["inplay"])
                            cat_runners = m.get("runners", [])
                            name_map = {r["selectionId"]: r.get("runnerName", "") for r in cat_runners}

                            odds = []
                            for r in book.get("runners", [])[:3]:
                                r["runnerName"] = name_map.get(r.get("selectionId"), "")
                                rp = self._map_runner_prices(r)
                                odds.append(self._odds_slot(rp))

                            while len(odds) < 3:
                                odds.append(None)
                            ev["odds"] = odds[:3]

                        if ev["sport_id"] == 4:
                            ev["badges"]["fancy"] = True
                            ev["badges"]["bookmaker"] = True
                except Exception:
                    logger.exception("Failed to batch-fetch market odds from Betfair")

            # Sort: in-play first, then by open_date
            events_list.sort(key=lambda e: (not e["inplay"], e["open_date"]))
            return events_list

        except Exception:
            logger.warning("Betfair events unavailable or geo-restricted; falling back to mock events feed.")
            return self._mock.events(sport_id, inplay_only)

    def event(self, event_id: int) -> Optional[dict]:
        """Returns event detail with markets (match_odds, bookmaker, fancy, last_digit)."""
        try:
            # Get event details
            events_result = self._call("listEvents", {
                "filter": {"eventIds": [str(event_id)]}
            })
            if not events_result:
                return None

            ev = events_result[0].get("event", {})
            event_name = ev.get("name", "Unknown")
            open_date = self._iso(ev.get("openDate"))
            parts = event_name.split(" v ", 1)
            home = parts[0].strip() if len(parts) == 2 else event_name
            away = parts[1].strip() if len(parts) == 2 else ""

            # Get all markets for this event
            markets_cat = self._call("listMarketCatalogue", {
                "filter": {"eventIds": [str(event_id)]},
                "maxResults": "50",
                "marketProjection": [
                    "RUNNER_DESCRIPTION", "COMPETITION", "EVENT",
                    "EVENT_TYPE", "MARKET_DESCRIPTION",
                ],
            })

            sport_id = 0
            sport_name = "Unknown"
            competition = ""
            inplay = False

            if markets_cat:
                event_type = markets_cat[0].get("eventType", {})
                sport_id = int(event_type.get("id", 0))
                sport_name = event_type.get("name", "Unknown")
                comp = markets_cat[0].get("competition", {})
                competition = comp.get("name", "")

            # Build detail response
            detail = {
                "event_id": event_id,
                "sport_id": sport_id,
                "sport_name": sport_name,
                "name": event_name,
                "home": home,
                "away": away,
                "competition": competition,
                "open_date": open_date,
                "inplay": inplay,
                "badges": {
                    "fancy": sport_id == 4,
                    "bookmaker": True,
                    "premium": False,
                    "tv": False,
                },
                "exposure": 0,
                "odds": [None, None, None],
                "score": None,
                "markets": {
                    "match_odds": None,
                    "bookmaker": None,
                    "fancy": [],
                    "last_digit": None,
                },
            }

            # Find Match Odds market
            match_odds_cat = next(
                (m for m in markets_cat if m.get("description", {}).get("marketType") == "MATCH_ODDS"),
                None
            )
            if not match_odds_cat:
                # Fallback: find by market name
                match_odds_cat = next(
                    (m for m in markets_cat if "match odds" in m.get("marketName", "").lower()),
                    None
                )

            if match_odds_cat:
                market_id = match_odds_cat["marketId"]
                cat_runners = match_odds_cat.get("runners", [])
                name_map = {r["selectionId"]: r.get("runnerName", "") for r in cat_runners}

                # Fetch live prices
                books = self._call("listMarketBook", {
                    "marketIds": [market_id],
                    "priceProjection": {
                        "priceData": ["EX_BEST_OFFERS"],
                        "exBestOffersOverrides": {"bestPricesDepth": 3},
                    },
                })

                if books:
                    book = books[0]
                    detail["inplay"] = book.get("inplay", False)
                    status = "OPEN" if book.get("status") == "OPEN" else "SUSPENDED"
                    runners = book.get("runners", [])

                    mapped_runners = []
                    for r in runners:
                        r["runnerName"] = name_map.get(r.get("selectionId"), "")
                        mapped_runners.append(self._map_runner_prices(r))

                    detail["markets"]["match_odds"] = {
                        "id": market_id,
                        "name": "Match Odds",
                        "status": status,
                        "min": 100,
                        "max": 200000,
                        "runners": mapped_runners,
                    }

                    # Also set top-level odds
                    odds = [self._odds_slot(rp) for rp in mapped_runners[:3]]
                    while len(odds) < 3:
                        odds.append(None)
                    detail["odds"] = odds[:3]

            # Find Bookmaker-style markets (Betfair doesn't have "bookmaker" market,
            # but we can map another market type or derive from match odds)
            # For now, generate bookmaker from match odds runners if available
            if detail["markets"]["match_odds"]:
                mo_runners = detail["markets"]["match_odds"]["runners"]
                bm_runners = []
                for r in mo_runners:
                    back_price = r["back"][0]["price"] if r["back"] else 2.0
                    back_pct = round((back_price - 1) * 100)
                    lay_pct = back_pct + 2
                    bm_runners.append({
                        "name": r["name"],
                        "back": back_pct,
                        "lay": lay_pct,
                    })
                detail["markets"]["bookmaker"] = {
                    "id": f"{event_id}-bm",
                    "name": "Bookmaker",
                    "status": detail["markets"]["match_odds"]["status"],
                    "min": 100,
                    "max": 500000,
                    "runners": bm_runners,
                }

            return detail

        except Exception:
            logger.warning("Betfair event %s unavailable or geo-restricted; falling back to mock event.", event_id)
            return self._mock.event(event_id)

    def bets(self, domain_key: str, event_id: Optional[int] = None) -> list[dict]:
        """Returns bets — uses mock feed bets to give active exchange transactions."""
        return self._mock.bets(domain_key, event_id)

    def news(self, brand_name: str) -> list[str]:
        """Returns news ticker strings."""
        return [
            f"WELCOME TO {brand_name.upper()} — LIVE CRICKET, FOOTBALL & TENNIS MARKETS 24x7",
            "POWERED BY BETFAIR EXCHANGE — REAL-TIME ODDS AND MARKET DATA",
        ]
