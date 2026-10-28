"""Mastan master panel: the downline's player-site bets, and result declaration."""
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_exchange_account
from app.core.database import get_db
from app.models.exchange import ExchangeAccount
from app.schemas.player import BetRow, DeclareResult, MarketResultRow, PendingMarket
from app.services.exchange.accounts import clients_below, portal_of, subtree
from app.services.exchange.betting import (
    BetRejected,
    bet_row,
    bets_query,
    pending_markets,
    recent_results,
    settle_market,
)

router = APIRouter()


def require_admin(account: ExchangeAccount) -> None:
    if account.role != "admin":
        raise HTTPException(status_code=403, detail="Only the Admin account can declare results")


@router.get("/bets", response_model=List[BetRow])
def bets(
    event_id: Optional[int] = Query(None),
    bet_status: Literal["open", "settled", "all"] = Query("open", alias="status"),
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    """Bets of every client below this account."""
    portal = portal_of(db, account)
    clients = clients_below(db, portal, account, subtree(db, account))
    if not clients:
        return []
    q = bets_query(db, [c.id for c in clients], None if bet_status == "all" else bet_status, event_id)
    return [bet_row(b) for b in q.limit(500).all()]


@router.get("/results/pending", response_model=List[PendingMarket])
def results_pending(account: ExchangeAccount = Depends(get_exchange_account), db: Session = Depends(get_db)):
    require_admin(account)
    return pending_markets(db, portal_of(db, account))


@router.get("/results", response_model=List[MarketResultRow])
def results(account: ExchangeAccount = Depends(get_exchange_account), db: Session = Depends(get_db)):
    require_admin(account)
    return recent_results(db, portal_of(db, account))


@router.post("/results", response_model=MarketResultRow)
def declare_result(
    req: DeclareResult,
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    require_admin(account)
    try:
        return settle_market(db, portal_of(db, account), req.market_id, req.winner, account.username)
    except BetRejected as e:
        raise HTTPException(status_code=400, detail=str(e))
