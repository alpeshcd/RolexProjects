"""Market data source for the Mastan master panel.

Everything the panel and the player site show about sports, fixtures, odds and
scores comes through a MarketFeed. Bets are our own (app.services.exchange.betting). Today that is MockFeed; when the client shares the Mastan
exchange API, add a feed that calls it, return the same shapes, and point
EXCHANGE_PROVIDER at it. The panel frontend does not change.

Shapes (all plain dicts, JSON-ready):

sport:  {id, name, event_count, inplay_count}
event:  {event_id, sport_id, sport_name, name, competition, open_date (ISO),
         inplay, badges: {fancy, bookmaker, premium, tv}, exposure,
         odds: [slot, slot, slot],  # runner 1, the draw, runner 2
         source: "mock" | "betfair" | ...}  # "mock" = demo prices
slot:   {back: {price, size} | None, lay: {price, size} | None} | None
detail: event + {home, away, score | None, markets: {match_odds, bookmaker,
         fancy: [...], last_digit}}
"""
from abc import ABC, abstractmethod
from typing import Optional

from app.core.config import settings


class MarketFeed(ABC):
    @abstractmethod
    def sports(self) -> list[dict]: ...

    @abstractmethod
    def events(self, sport_id: Optional[int] = None, inplay_only: bool = False) -> list[dict]: ...

    @abstractmethod
    def event(self, event_id: int) -> Optional[dict]: ...

    @abstractmethod
    def news(self, brand_name: str) -> list[str]: ...


_feed: Optional[MarketFeed] = None


def get_feed() -> MarketFeed:
    global _feed
    if _feed is None:
        if settings.EXCHANGE_PROVIDER == "mock":
            from app.services.exchange.mock_feed import MockFeed
            _feed = MockFeed()
        elif settings.EXCHANGE_PROVIDER == "mastan":
            from app.services.exchange.mastan_feed import MastanFeed
            _feed = MastanFeed()
        elif settings.EXCHANGE_PROVIDER == "betfair":
            from app.services.exchange.betfair_feed import BetfairFeed
            _feed = BetfairFeed()
        else:
            raise RuntimeError(f"Unknown EXCHANGE_PROVIDER '{settings.EXCHANGE_PROVIDER}'")
    return _feed
