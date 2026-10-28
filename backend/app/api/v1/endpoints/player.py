"""Player site: client login, markets, placing bets, my bets and A/C statement.

Clients are the Rolex `users` rows (role "client") of a domain portal, created
from the master panel or Rolex. The site's host picks the portal, the same way
the master panel does.
"""
from datetime import date, datetime, time, timedelta
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import CLIENT_ROLE, PLAYER_TOKEN_TYPE, get_player, get_player_optional
from app.api.v1.endpoints.exchange import portal_info
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.portal import DomainPortal
from app.models.statement import AccountStatement
from app.models.user import User
from app.schemas.exchange import PanelPortal
from app.schemas.player import (
    BetRow,
    PlaceBetRequest,
    PlaceBetResponse,
    PlayerAccount,
    PlayerLoginRequest,
    PlayerLoginResponse,
    PlayerMe,
    PlayerPasswordChange,
    PlayerStatementRow,
)
from app.services.exchange.accounts import find_portal
from app.services.exchange.betting import (
    BetRejected,
    bet_row,
    bets_query,
    event_positions,
    is_demo,
    place_bet,
    user_exposure,
)
from app.services.exchange.feed import get_feed

router = APIRouter()


def portal_of_player(db: Session, user: User) -> DomainPortal:
    return db.query(DomainPortal).filter(func.lower(DomainPortal.domain_url) == (user.domain or "").lower()).first()


def account_info(db: Session, user: User) -> PlayerAccount:
    balance = round(user.balance or 0.0, 2)
    exposure = user_exposure(db, user)
    return PlayerAccount(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        balance=balance,
        exposure=exposure,
        available=round(balance - exposure, 2),
        master=user.master,
    )


# ---- Session ------------------------------------------------------------

@router.get("/portal", response_model=PanelPortal)
def get_portal(host: str = Query(..., description="Browser host, e.g. mastan365.localhost"), db: Session = Depends(get_db)):
    portal = find_portal(db, host)
    if not portal:
        raise HTTPException(status_code=404, detail=f"No active portal is set up for '{host}'")
    return portal_info(portal)


@router.post("/login", response_model=PlayerLoginResponse)
def login(req: PlayerLoginRequest, db: Session = Depends(get_db)):
    portal = find_portal(db, req.host)
    if not portal:
        raise HTTPException(status_code=404, detail=f"No active portal is set up for '{req.host}'")
    user = db.query(User).filter(
        func.upper(User.username) == req.username.strip().upper(),
        User.role == CLIENT_ROLE,
        func.lower(User.domain) == portal.domain_url.lower(),
    ).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This account is locked by your upline")

    return PlayerLoginResponse(
        access_token=create_access_token(user.username, token_type=PLAYER_TOKEN_TYPE),
        account=account_info(db, user),
        portal=portal_info(portal),
    )


@router.get("/me", response_model=PlayerMe)
def me(user: User = Depends(get_player), db: Session = Depends(get_db)):
    return PlayerMe(account=account_info(db, user), portal=portal_info(portal_of_player(db, user)))


@router.post("/change-password")
def change_password(req: PlayerPasswordChange, user: User = Depends(get_player), db: Session = Depends(get_db)):
    if not verify_password(req.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# ---- Markets ------------------------------------------------------------

@router.get("/sports")
def sports(user: Optional[User] = Depends(get_player_optional)):
    return get_feed().sports()


@router.get("/events")
def events(
    sport_id: Optional[int] = Query(None),
    inplay: bool = Query(False, description="Only events in play"),
    user: Optional[User] = Depends(get_player_optional),
):
    return get_feed().events(sport_id=sport_id, inplay_only=inplay)


@router.get("/events/{event_id}")
def event(
    event_id: int,
    user: Optional[User] = Depends(get_player_optional),
    db: Session = Depends(get_db),
):
    detail = get_feed().event(event_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Event not found or already closed")
    # The player's profit/loss on each runner, shown under the runner names
    detail["positions"] = event_positions(db, user, event_id) if user else {}
    detail["betting_open"] = not is_demo(detail) or settings.PLAYER_ALLOW_DEMO_ODDS
    return detail


# ---- Bets ---------------------------------------------------------------

@router.post("/bets", response_model=PlaceBetResponse, status_code=status.HTTP_201_CREATED)
def create_bet(req: PlaceBetRequest, user: User = Depends(get_player), db: Session = Depends(get_db)):
    try:
        bet = place_bet(db, user, req)
    except BetRejected as e:
        raise HTTPException(status_code=400, detail=str(e))
    return PlaceBetResponse(bet=BetRow(**bet_row(bet)), account=account_info(db, user))


@router.get("/bets", response_model=List[BetRow])
def my_bets(
    bet_status: Optional[Literal["open", "settled"]] = Query(None, alias="status"),
    event_id: Optional[int] = Query(None),
    user: User = Depends(get_player),
    db: Session = Depends(get_db),
):
    return [bet_row(b) for b in bets_query(db, [user.id], bet_status, event_id).limit(500).all()]


@router.get("/statement", response_model=List[PlayerStatementRow])
def statement(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    user: User = Depends(get_player),
    db: Session = Depends(get_db),
):
    q = db.query(AccountStatement).filter(
        AccountStatement.username == user.username,
        func.lower(AccountStatement.domain) == (user.domain or "").lower(),
    )
    if start_date:
        q = q.filter(AccountStatement.date >= datetime.combine(start_date, time.min))
    if end_date:
        q = q.filter(AccountStatement.date < datetime.combine(end_date + timedelta(days=1), time.min))
    return [
        PlayerStatementRow(
            id=s.id,
            date=s.date,
            type=s.type,
            description=s.description,
            credit=s.amount if (s.amount or 0) > 0 else 0.0,
            debit=-s.amount if (s.amount or 0) < 0 else 0.0,
            balance=s.balance or 0.0,
        )
        for s in q.order_by(AccountStatement.date.desc(), AccountStatement.id.desc()).limit(500).all()
    ]
