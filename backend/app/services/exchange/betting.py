"""Player-site bets: pricing checks, exposure, and settlement.

The house takes the other side of every bet (as on the Mastan sites), so a bet
is matched in full the moment it is accepted. Nothing leaves the client's
balance when a bet is placed; instead the worst case across a market's runners
(its exposure) is held back from what they can bet or withdraw, and the
balance moves once when the result is declared.

Markets: Match Odds (decimal prices) and Bookmaker (rates, 45 = 1.45 decimal).
"""
import json
import time
from collections import defaultdict
from datetime import datetime
from typing import Iterable, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.exchange import Bet, MarketResult
from app.models.portal import DomainPortal
from app.models.statement import AccountStatement
from app.models.user import User
from app.services.exchange.feed import get_feed

MARKET_TYPES = ("match_odds", "bookmaker")
VOID = "VOID"
MIN_ODDS, MAX_ODDS = 1.01, 1000.0


class BetRejected(Exception):
    """The bet (or result) can't be accepted; the message is shown to the user."""


def is_demo(detail: dict) -> bool:
    return detail.get("source") == "mock"


def rate_of(market_type: str, odds: float):
    """Price as the player sees it: decimal for Match Odds, rate for Bookmaker."""
    return round((odds - 1) * 100) if market_type == "bookmaker" else round(odds, 2)


def amounts(side: str, odds: float, stake: float) -> tuple[float, float]:
    """The player's profit/loss if the selection wins, and if it loses."""
    profit = round(stake * (odds - 1), 2)
    return (profit, -stake) if side == "back" else (-profit, stake)


# ---- Exposure -----------------------------------------------------------

def market_book(bets: Iterable) -> dict[str, float]:
    """Profit/loss on each runner of one market if that runner wins."""
    bets = list(bets)
    runners = json.loads(bets[-1].runners) if bets else []
    book = {r: 0.0 for r in runners}
    for b in bets:
        book.setdefault(b.selection, 0.0)
    for r in book:
        book[r] = round(sum(b.win_amount if b.selection == r else b.lose_amount for b in bets), 2)
    return book


def exposure_of(bets: Iterable) -> float:
    """Sum over markets of the worst case loss."""
    by_market: dict[str, list] = defaultdict(list)
    for b in bets:
        by_market[b.market_id].append(b)
    return round(sum(max(0.0, -min(market_book(bs).values(), default=0.0)) for bs in by_market.values()), 2)


def open_bets(db: Session, user_ids: Iterable[int]):
    return db.query(Bet).filter(Bet.user_id.in_(list(user_ids)), Bet.status == "open")


def exposures(db: Session, user_ids: Iterable[int]) -> dict[int, float]:
    by_user: dict[int, list[Bet]] = defaultdict(list)
    for b in open_bets(db, user_ids).order_by(Bet.id).all():
        by_user[b.user_id].append(b)
    return {uid: exposure_of(bs) for uid, bs in by_user.items()}


def user_exposure(db: Session, user: User) -> float:
    return exposures(db, [user.id]).get(user.id, 0.0)


def event_positions(db: Session, user: User, event_id: int) -> dict[str, dict[str, float]]:
    """{market_id: {runner: profit/loss if it wins}} for the match page."""
    by_market: dict[str, list[Bet]] = defaultdict(list)
    for b in open_bets(db, [user.id]).filter(Bet.event_id == event_id).order_by(Bet.id).all():
        by_market[b.market_id].append(b)
    return {mid: market_book(bs) for mid, bs in by_market.items()}


# ---- Placing a bet ------------------------------------------------------

def _quote(detail: dict, market_type: str, market_id: str, selection: str, side: str) -> tuple[dict, list[str], float]:
    """The market, its runner names, and the current price for this side."""
    market = detail.get("markets", {}).get(market_type)
    if not market or str(market.get("id")) != market_id:
        raise BetRejected("This market is closed")
    if market.get("status") != "OPEN":
        raise BetRejected(f"Market is {str(market.get('status', 'closed')).replace('_', ' ').lower()}")
    runners = [r["name"] for r in market.get("runners", [])]
    runner = next((r for r in market.get("runners", []) if r["name"] == selection), None)
    if runner is None:
        raise BetRejected(f"{selection} is not in this market")

    if market_type == "match_odds":
        level = runner.get(side) or []
        price = level[0]["price"] if level else None
    else:
        rate = runner.get(side) or 0
        price = 1 + rate / 100 if rate > 0 else None
    if not price:
        raise BetRejected("No price available right now")
    return market, runners, price


def _check(detail: dict, req) -> tuple[dict, list[str]]:
    if is_demo(detail) and not settings.PLAYER_ALLOW_DEMO_ODDS:
        raise BetRejected("Betting is paused: live odds are not available right now")
    market, runners, price = _quote(detail, req.market_type, req.market_id, req.selection, req.side)
    # Matched at the requested price as long as the market still offers it (or better)
    moved = price < req.odds - 1e-9 if req.side == "back" else price > req.odds + 1e-9
    if moved:
        raise BetRejected(f"Odds changed to {rate_of(req.market_type, price)}. Please try again")
    lo, hi = market.get("min") or 0, market.get("max")
    if req.stake < lo or (hi and req.stake > hi):
        raise BetRejected(f"Stake must be between {lo:,.0f} and {hi:,.0f}" if hi else f"Minimum stake is {lo:,.0f}")
    return market, runners


def place_bet(db: Session, user: User, req) -> Bet:
    if req.market_type not in MARKET_TYPES:
        raise BetRejected("Betting on this market is not open yet")
    if not MIN_ODDS <= req.odds <= MAX_ODDS:
        raise BetRejected("Invalid odds")

    feed = get_feed()
    detail = feed.event(req.event_id)
    if not detail:
        raise BetRejected("Match not found or already closed")
    _check(detail, req)

    # In-play prices move fast: hold the bet, then re-check it at the new price
    if detail.get("inplay") and settings.PLAYER_BET_DELAY_SECONDS > 0:
        time.sleep(settings.PLAYER_BET_DELAY_SECONDS)
        detail = feed.event(req.event_id)
        if not detail:
            raise BetRejected("Match not found or already closed")
    market, runners = _check(detail, req)

    win, lose = amounts(req.side, req.odds, req.stake)
    bet = Bet(
        user_id=user.id,
        username=user.username,
        domain=user.domain,
        event_id=req.event_id,
        event_name=detail.get("name", ""),
        sport_name=detail.get("sport_name"),
        market_id=req.market_id,
        market_type=req.market_type,
        market_name=market.get("name") or req.market_type,
        runners=json.dumps(runners),
        selection=req.selection,
        side=req.side,
        odds=req.odds,
        stake=req.stake,
        win_amount=win,
        lose_amount=lose,
        demo_odds=is_demo(detail),
        status="open",
        placed_at=datetime.utcnow(),
    )

    # Lock the client so two bets at once can't both spend the same balance
    db.refresh(user, with_for_update=True)
    if not user.is_active:
        raise BetRejected("Your account is locked")
    current = open_bets(db, [user.id]).order_by(Bet.id).all()
    if exposure_of(current + [bet]) > (user.balance or 0.0) + 1e-9:
        db.rollback()
        raise BetRejected(f"Insufficient balance (Available: {(user.balance or 0.0) - exposure_of(current):,.2f})")
    db.add(bet)
    db.commit()
    db.refresh(bet)
    return bet


# ---- Results ------------------------------------------------------------

def portal_open_bets(db: Session, portal: DomainPortal):
    return db.query(Bet).filter(Bet.status == "open", func.lower(Bet.domain) == portal.domain_url.lower())


def pending_markets(db: Session, portal: DomainPortal) -> list[dict]:
    """Markets with open bets on this portal, waiting for a result."""
    groups: dict[str, list[Bet]] = defaultdict(list)
    for b in portal_open_bets(db, portal).order_by(Bet.id).all():
        groups[b.market_id].append(b)
    out = []
    for market_id, bets in groups.items():
        last = bets[-1]
        out.append({
            "market_id": market_id,
            "market_type": last.market_type,
            "market_name": last.market_name,
            "event_id": last.event_id,
            "event_name": last.event_name,
            "sport_name": last.sport_name,
            "runners": json.loads(last.runners),
            "bet_count": len(bets),
            "total_stake": round(sum(b.stake for b in bets), 2),
            # The house's side of the book: minus what the clients would make
            "book": {r: -v for r, v in market_book(bets).items()},
            "last_bet_at": last.placed_at,
        })
    return sorted(out, key=lambda m: m["last_bet_at"], reverse=True)


def settle_market(db: Session, portal: DomainPortal, market_id: str, winner: str, declared_by: str) -> MarketResult:
    if db.query(MarketResult).filter(MarketResult.domain_key == portal.domain_key,
                                     MarketResult.market_id == market_id).first():
        raise BetRejected("Result for this market is already declared")
    bets = portal_open_bets(db, portal).filter(Bet.market_id == market_id).order_by(Bet.id).all()
    if not bets:
        raise BetRejected("No open bets on this market")
    runners = json.loads(bets[-1].runners)
    void = winner == VOID
    if not void and winner not in runners:
        raise BetRejected(f"{winner} is not a runner in this market")

    now = datetime.utcnow()
    totals: dict[int, float] = defaultdict(float)
    for b in bets:
        selection_won = b.selection == winner
        b.pl = 0.0 if void else (b.win_amount if selection_won else b.lose_amount)
        # Won/lost from the player's side: a lay bet wins when its selection loses
        b.status = "void" if void else ("won" if selection_won == (b.side == "back") else "lost")
        b.settled_at = now
        totals[b.user_id] += b.pl

    first = bets[-1]
    if not void:
        for user_id, total in totals.items():
            user = db.query(User).filter(User.id == user_id).with_for_update().one()
            total = round(total, 2)
            user.balance = round((user.balance or 0.0) + total, 2)
            db.add(AccountStatement(
                site_user=f"{user.username} ({portal.domain_url})",
                domain=portal.domain_url,
                username=user.username,
                date=now,
                event_type=first.sport_name or "-",
                amount=total,
                total=total,
                balance=user.balance,
                type="Profit & Loss",
                dc="Credit" if total >= 0 else "Debit",
                description=f"{first.sport_name or 'Sport'} / {first.event_name} / {first.market_name} / Winner: {winner}",
                created_at=now,
            ))

    result = MarketResult(
        domain_key=portal.domain_key,
        market_id=market_id,
        event_id=first.event_id,
        event_name=first.event_name,
        market_name=first.market_name,
        winner=winner,
        bet_count=len(bets),
        declared_by=declared_by,
        declared_at=now,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def bet_row(b: Bet) -> dict:
    """One bet as the panel and the player site list it."""
    return {
        "id": b.id,
        "client": b.username,
        "event_id": b.event_id,
        "event_name": b.event_name,
        "sport_name": b.sport_name,
        "market": b.market_type,
        "market_id": b.market_id,
        "market_name": b.market_name,
        "runner": b.selection,
        "side": b.side,
        "rate": rate_of(b.market_type, b.odds),
        "run": None,
        "stake": b.stake,
        # Open bets show what the player makes if the selection wins
        "pl": b.win_amount if b.status == "open" else b.pl,
        "liability": -min(b.win_amount, b.lose_amount),
        "status": b.status,
        "demo_odds": bool(b.demo_odds),
        "placed_at": b.placed_at,
        "settled_at": b.settled_at,
    }


def recent_results(db: Session, portal: DomainPortal, limit: int = 50) -> list[MarketResult]:
    return (db.query(MarketResult).filter(MarketResult.domain_key == portal.domain_key)
            .order_by(MarketResult.id.desc()).limit(limit).all())


def bets_query(db: Session, user_ids: Iterable[int], status: Optional[str] = None, event_id: Optional[int] = None):
    q = db.query(Bet).filter(Bet.user_id.in_(list(user_ids)))
    if status == "open":
        q = q.filter(Bet.status == "open")
    elif status == "settled":
        q = q.filter(Bet.status != "open")
    if event_id is not None:
        q = q.filter(Bet.event_id == event_id)
    return q.order_by(Bet.id.desc())
