"""What the player site is served for the casino page.

Same arrangement as the market feed (`app.services.exchange.feed`): one small
interface, a demo implementation that works offline, and a live one that calls
the client's platform. The dicts both return have the keys `user-site`'s
Casino page already renders, so the frontend does not change when the client's
credentials go in.

    CASINO_PROVIDER=mock   the built-in demo table list (default)
    CASINO_PROVIDER=live   GET /games and POST /launch-url on the platform
"""
import logging
import secrets
import threading
from abc import ABC, abstractmethod
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.services.casino import wallet
from app.services.casino.platform import CasinoPlatformError, get_platform

logger = logging.getLogger(__name__)

# Keywords that put a platform game into one of the categories the player
# site's filter bar offers.
CATEGORY_KEYWORDS: list[tuple[str, tuple[str, ...]]] = [
    ("teen_patti", ("teenpatti", "teen patti", "teen-patti", "3 patti", "32 card")),
    ("andar_bahar", ("andar", "bahar")),
    ("dragon_tiger", ("dragon", "tiger")),
    ("roulette", ("roulette",)),
    ("baccarat", ("baccarat", "punto")),
    ("blackjack", ("blackjack", "black jack", "21")),
    ("poker", ("poker", "hold'em", "holdem")),
    ("lucky7", ("lucky 7", "lucky7")),
]


def categorise(name: str, slug: str = "") -> str:
    """The player site's category for a platform game."""
    text = f"{name} {slug}".lower()
    for category, words in CATEGORY_KEYWORDS:
        if any(word in text for word in words):
            return category
    return "other"


class CasinoCatalog(ABC):
    """Tables the player site lists, and opening one."""

    @abstractmethod
    def tables(self) -> list[dict]: ...

    @abstractmethod
    def launch(self, db: Session, user: Optional[User], table_id: str) -> dict: ...

    def providers(self) -> list[str]:
        """The providers present in the current catalog, for the filter bar."""
        seen: list[str] = []
        for table in self.tables():
            provider = table.get("provider")
            if provider and provider not in seen:
                seen.append(provider)
        return seen


# ---- demo catalog ------------------------------------------------------

DEMO_TABLES: list[dict] = [
    {
        "id": "aura-tp-1",
        "name": "Live Teen Patti 20-20",
        "category": "teen_patti",
        "provider": "Aura",
        "image": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 100000.0,
        "players_count": 640,
        "is_active": True,
    },
    {
        "id": "evo-roulette-1",
        "name": "Lightning Roulette",
        "category": "roulette",
        "provider": "Evolution",
        "image": "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 200000.0,
        "players_count": 890,
        "is_active": True,
    },
    {
        "id": "ezugi-ab-1",
        "name": "Super Andar Bahar Live",
        "category": "andar_bahar",
        "provider": "Ezugi",
        "image": "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 150000.0,
        "players_count": 520,
        "is_active": True,
    },
    {
        "id": "aura-dt-1",
        "name": "Dragon Tiger Fast",
        "category": "dragon_tiger",
        "provider": "Aura",
        "image": "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 250000.0,
        "players_count": 410,
        "is_active": True,
    },
    {
        "id": "evo-bacc-1",
        "name": "Speed Baccarat A",
        "category": "baccarat",
        "provider": "Evolution",
        "image": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&auto=format&fit=crop&q=80",
        "min_bet": 200.0,
        "max_bet": 300000.0,
        "players_count": 380,
        "is_active": True,
    },
    {
        "id": "ezugi-32cards-1",
        "name": "32 Cards Live",
        "category": "teen_patti",
        "provider": "Ezugi",
        "image": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 100000.0,
        "players_count": 290,
        "is_active": True,
    },
    {
        "id": "aura-lucky7-1",
        "name": "Lucky 7 Live",
        "category": "other",
        "provider": "Aura",
        "image": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 150000.0,
        "players_count": 350,
        "is_active": True,
    },
    {
        "id": "evo-bj-1",
        "name": "VIP Live Blackjack",
        "category": "blackjack",
        "provider": "Evolution",
        "image": "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&auto=format&fit=crop&q=80",
        "min_bet": 500.0,
        "max_bet": 500000.0,
        "players_count": 210,
        "is_active": True,
    },
    {
        "id": "super-poker-1",
        "name": "Casino Hold'em Poker",
        "category": "poker",
        "provider": "Super Spade",
        "image": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&auto=format&fit=crop&q=80",
        "min_bet": 100.0,
        "max_bet": 100000.0,
        "players_count": 180,
        "is_active": True,
    },
]


class MockCatalog(CasinoCatalog):
    """The demo table list, and a self-hosted placeholder table screen."""

    def tables(self) -> list[dict]:
        return DEMO_TABLES

    def launch(self, db: Session, user: Optional[User], table_id: str) -> dict:
        table = next((t for t in DEMO_TABLES if t["id"] == table_id), None)
        if not table:
            raise CasinoPlatformError(f"Casino table '{table_id}' not found", code="NOT_FOUND", status=404)
        username = user.username if user else "demo_player"
        user_id = str(user.id) if user else "0"
        return {
            "table_id": table["id"],
            "table_name": table["name"],
            "launch_url": (
                f"/casino-player.html?tableId={table['id']}&provider={table['provider']}"
                f"&user={username}&uid={user_id}"
            ),
            "token": f"session-{username}-{table['id']}",
            "provider": table["provider"],
        }


# ---- live catalog ------------------------------------------------------

class LiveCatalog(CasinoCatalog):
    """The client's platform: its games list, and its launch URLs."""

    def tables(self) -> list[dict]:
        games = get_platform().games()
        return [self._as_table(g) for g in games]

    @staticmethod
    def _as_table(game: dict) -> dict:
        name = str(game.get("name") or "").strip()
        slug = str(game.get("slug") or "")
        return {
            "id": str(game.get("id")),
            "name": name,
            "category": categorise(name, slug),
            "provider": settings.CASINO_PROVIDER_NAME,
            "image": game.get("thumbnail_url") or "",
            "min_bet": settings.CASINO_MIN_BET,
            "max_bet": settings.CASINO_MAX_BET,
            # The platform's games list carries no live headcount, so there is
            # nothing honest to show here; the card hides the badge at 0.
            "players_count": 0,
            "is_active": True,
            "slug": slug,
            "special_note": game.get("special_note"),
            "currency": game.get("currency"),
        }

    def launch(self, db: Session, user: Optional[User], table_id: str) -> dict:
        if not user:
            raise CasinoPlatformError(
                "Please sign in to open a live casino table",
                code="UNAUTHORIZED",
                status=401,
            )

        table = next((t for t in self.tables() if t["id"] == str(table_id)), None)
        if not table:
            raise CasinoPlatformError(f"Casino table '{table_id}' not found", code="NOT_FOUND", status=404)

        try:
            game_id = int(table["id"])
        except (TypeError, ValueError):
            game_id = None

        # We mint the session token ourselves so the wallet calls the platform
        # makes later map straight back to this client.
        token = secrets.token_urlsafe(32)
        data = get_platform().launch_url(
            player_id=user.username,
            name=user.full_name or user.username,
            currency=table.get("currency") or settings.CASINO_CURRENCY,
            player_session_token=token,
            game_id=game_id,
            bet_limit={
                "min": f"{settings.CASINO_MIN_BET:.2f}",
                "max": f"{settings.CASINO_MAX_BET:.2f}",
            },
        )

        # The platform echoes the token it ended up using: ours, or one it
        # generated when we sent none.
        token = data.get("player_session_token") or token
        wallet.open_session(
            db,
            user,
            token=token,
            player_id=user.username,
            game_id=game_id,
            game_name=table["name"],
            currency=table.get("currency") or settings.CASINO_CURRENCY,
            launch_url=data["url"],
        )

        return {
            "table_id": table["id"],
            "table_name": table["name"],
            "launch_url": data["url"],
            "token": token,
            "provider": table["provider"],
        }


_catalog: Optional[CasinoCatalog] = None
_catalog_lock = threading.Lock()


def get_catalog() -> CasinoCatalog:
    global _catalog
    if _catalog is None:
        with _catalog_lock:
            if _catalog is None:
                provider = (settings.CASINO_PROVIDER or "mock").lower()
                if provider == "mock":
                    _catalog = MockCatalog()
                elif provider == "live":
                    _catalog = LiveCatalog()
                else:
                    raise RuntimeError(f"Unknown CASINO_PROVIDER '{settings.CASINO_PROVIDER}'")
    return _catalog


def reset_catalog() -> None:
    """Drop the cached catalog, so a settings change is picked up."""
    global _catalog
    with _catalog_lock:
        _catalog = None
