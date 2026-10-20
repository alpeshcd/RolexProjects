"""Mastan master panel: login, account header, and market data.

Market data goes through the MarketFeed (mock until the Mastan API arrives);
accounts and balances live in the Rolex database.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import EXCHANGE_TOKEN_TYPE, get_exchange_account
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.exchange import ExchangeAccount
from app.models.portal import DomainPortal
from app.schemas.exchange import (
    PanelAccount,
    PanelLoginRequest,
    PanelLoginResponse,
    PanelMe,
    PanelPasswordChange,
    PanelPortal,
)
from app.services.exchange.accounts import (
    CHILD_ROLES,
    ROLE_LABELS,
    ensure_admin_account,
    find_portal,
    get_balance,
    portal_of,
)
from app.services.exchange.feed import get_feed

router = APIRouter()


def portal_info(portal: DomainPortal) -> PanelPortal:
    return PanelPortal(
        domain_key=portal.domain_key,
        domain_url=portal.domain_url,
        brand_name=portal.brand_name,
        domain_title=portal.domain_title,
    )


def account_info(db: Session, account: ExchangeAccount) -> PanelAccount:
    portal = portal_of(db, account)
    return PanelAccount(
        id=account.id,
        username=account.username,
        full_name=account.full_name,
        role=account.role,
        role_label=ROLE_LABELS[account.role],
        domain_key=account.domain_key,
        balance=round(get_balance(db, account), 2),
        # Until the Mastan API defines "Upline", the admin shows the portal P/L from Rolex
        upline=round(portal.pl or 0.0, 2) if account.role == "admin" else 0.0,
        exposure=0.0,
        credit_reference=account.credit_reference or 0.0,
        partnership=account.partnership or 0.0,
        child_roles=CHILD_ROLES.get(account.role, []),
        created_at=account.created_at,
    )


# ---- Session ------------------------------------------------------------

@router.get("/portal", response_model=PanelPortal)
def get_portal(host: str = Query(..., description="Browser host, e.g. mastan365.localhost"), db: Session = Depends(get_db)):
    portal = find_portal(db, host)
    if not portal:
        raise HTTPException(status_code=404, detail=f"No active portal is set up for '{host}'")
    return portal_info(portal)


@router.post("/login", response_model=PanelLoginResponse)
def login(req: PanelLoginRequest, db: Session = Depends(get_db)):
    portal = find_portal(db, req.host)
    if not portal:
        raise HTTPException(status_code=404, detail=f"No active portal is set up for '{req.host}'")
    ensure_admin_account(db, portal)

    account = db.query(ExchangeAccount).filter(
        ExchangeAccount.username == req.username.strip().upper(),
        ExchangeAccount.domain_key == portal.domain_key,
    ).first()
    if not account or not verify_password(req.password, account.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if not account.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This account is locked by your upline")

    return PanelLoginResponse(
        access_token=create_access_token(account.username, token_type=EXCHANGE_TOKEN_TYPE),
        account=account_info(db, account),
        portal=portal_info(portal),
    )


@router.get("/me", response_model=PanelMe)
def me(account: ExchangeAccount = Depends(get_exchange_account), db: Session = Depends(get_db)):
    return PanelMe(account=account_info(db, account), portal=portal_info(portal_of(db, account)))


@router.post("/change-password")
def change_password(
    req: PanelPasswordChange,
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    if not verify_password(req.old_password, account.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    account.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# ---- Markets ------------------------------------------------------------

@router.get("/sports")
def sports(account: ExchangeAccount = Depends(get_exchange_account)):
    return get_feed().sports()


@router.get("/events")
def events(
    sport_id: Optional[int] = Query(None),
    inplay: bool = Query(False, description="Only events in play"),
    account: ExchangeAccount = Depends(get_exchange_account),
):
    return get_feed().events(sport_id=sport_id, inplay_only=inplay)


@router.get("/events/{event_id}")
def event(event_id: int, account: ExchangeAccount = Depends(get_exchange_account)):
    detail = get_feed().event(event_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Event not found or already closed")
    return detail


@router.get("/bets")
def bets(event_id: Optional[int] = Query(None), account: ExchangeAccount = Depends(get_exchange_account)):
    return get_feed().bets(account.domain_key, event_id=event_id)


@router.get("/news")
def news(account: ExchangeAccount = Depends(get_exchange_account), db: Session = Depends(get_db)):
    return get_feed().news(portal_of(db, account).brand_name)
