"""Live casino, as the player site and the panel use it.

The table list and the launch URL come from whichever catalog is configured
(`app.services.casino.catalog`): the built-in demo list, or the client's
platform via its Operator API. The shapes are the same either way, so the
player site's casino page does not change when the credentials go in.

The platform's own calls to us — balance, exposure, settlement, rollback —
are not here; they are the Operator wallet API in `casino_wallet.py`, mounted
outside /api/v1 at the base URL we hand the platform.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_player_optional
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.casino import (
    CasinoIntegrationStatus,
    CasinoLaunchRequest,
    CasinoLaunchResponse,
    CasinoTable,
)
from app.services.casino.catalog import get_catalog
from app.services.casino.platform import CasinoPlatformError, get_platform

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/providers", response_model=List[str])
def get_casino_providers():
    """The providers present in the current catalog, for the filter bar."""
    try:
        return get_catalog().providers()
    except CasinoPlatformError as exc:
        logger.warning("Casino providers unavailable: %s", exc)
        return []


@router.get("/tables", response_model=List[CasinoTable])
def get_casino_tables(
    provider: Optional[str] = Query(None, description="Filter by provider"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """The live tables on offer, with the player site's filters applied."""
    try:
        tables = get_catalog().tables()
    except CasinoPlatformError as exc:
        # The casino page should say it is empty, not break the whole site.
        logger.error("Casino table list unavailable: %s", exc)
        raise HTTPException(status_code=503, detail="Live casino is temporarily unavailable")

    if provider and provider.upper() != "ALL":
        tables = [t for t in tables if (t.get("provider") or "").lower() == provider.lower()]
    if category and category.upper() != "ALL":
        tables = [t for t in tables if (t.get("category") or "").lower() == category.lower()]
    return tables


@router.post("/launch", response_model=CasinoLaunchResponse)
def launch_casino_table(
    req: CasinoLaunchRequest,
    user: Optional[User] = Depends(get_player_optional),
    db: Session = Depends(get_db),
):
    """Open a table.

    On the live catalog this asks the platform for a launch URL, which creates
    the player there on the fly, and records the `player_session_token` the
    platform will quote back to us on every wallet call for this session.
    """
    try:
        return CasinoLaunchResponse(**get_catalog().launch(db, user, req.table_id))
    except CasinoPlatformError as exc:
        status = exc.status if exc.status in (401, 404) else 502
        logger.error("Casino launch failed for table %s: %s", req.table_id, exc)
        raise HTTPException(status_code=status, detail=str(exc))


@router.get("/status", response_model=CasinoIntegrationStatus)
def casino_status():
    """How the casino link is configured, for the panel's settings screen.

    Reports whether the credentials are in place, never what they are.
    """
    platform = get_platform()
    games = 0
    if (settings.CASINO_PROVIDER or "").lower() == "live":
        try:
            games = len(platform.games())
        except CasinoPlatformError as exc:
            logger.warning("Casino status could not read the games list: %s", exc)
    else:
        games = len(get_catalog().tables())

    valid_until = platform.token_valid_until
    return CasinoIntegrationStatus(
        provider=(settings.CASINO_PROVIDER or "mock").lower(),
        wallet_model=(settings.CASINO_WALLET_MODEL or "exposure").lower(),
        platform_configured=platform.configured,
        api_key_configured=bool(settings.CASINO_OPERATOR_API_KEY),
        wallet_base_path=settings.CASINO_WALLET_BASE_PATH,
        games_cached=games,
        token_valid_until=valid_until.isoformat() + "Z" if valid_until else None,
        last_error=platform.last_error,
    )


@router.post("/games/refresh", response_model=List[CasinoTable])
def refresh_casino_games():
    """Re-read the platform's games list now, instead of waiting for the cache
    to lapse. The spec asks for this once or twice a day."""
    if (settings.CASINO_PROVIDER or "").lower() != "live":
        return get_catalog().tables()
    try:
        get_platform().games(refresh=True)
    except CasinoPlatformError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return get_catalog().tables()
