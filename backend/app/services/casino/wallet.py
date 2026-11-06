"""Outbound side of the casino integration: Platform (client) -> Operator (us).

This is the money. The platform calls our wallet endpoints to hold exposure,
take stakes, pay settlements and roll settlements back, and everything here
moves a real `users.balance` and writes the player's A/C statement.

How the two wallet models land in our schema
--------------------------------------------
Exposure (default, and the model our own sports book already uses): nothing
leaves the balance while a round is live. The worst case the platform reports
is held in `casino_round_exposures` and kept back from what the player can bet
or withdraw. At settlement the hold is released and the balance moves once, by
the `pl` the platform sends.

Seamless: the stake is debited the moment bets are placed and the payout is
credited at settlement, each as its own `casino_transactions` row.

The balance we report back is always what the player can actually use —
`users.balance` minus the sports exposure minus the casino exposure still held
— which is what the spec asks for ("subtract this exposure amount from the
user's balance and return the resulting balance").

Idempotency
-----------
Every applied movement is a `casino_transactions` row keyed by the platform's
`transaction_id`. A replay finds the row and returns the current balance
without moving money again. Rollback/resettlement carries two keys
(`rollback_transaction_id` for `rollback_pl`, `transaction_id` for `pl`) and
each leg is deduped on its own.
"""
import json
import logging
import threading
import time
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Iterable, Optional

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.casino import CasinoBet, CasinoRoundExposure, CasinoSession, CasinoTransaction
from app.models.statement import AccountStatement
from app.models.user import User

logger = logging.getLogger(__name__)

# The error codes the platform understands. All of them go out with HTTP 400.
REQUEST_DECLINED = "REQUEST_DECLINED"
TOKEN_EXPIRED = "TOKEN_EXPIRED"
INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
ACCOUNT_BLOCKED = "ACCOUNT_BLOCKED"
INVALID_API_KEY = "INVALID_API_KEY"
UNKNOWN_ERROR = "UNKNOWN_ERROR"

CLIENT_ROLE = "client"


class WalletError(Exception):
    """A declined wallet call. Carries the platform's error code and, where we
    know them, the player's balance and version so the platform can resync."""

    def __init__(
        self,
        code: str,
        message: str,
        balance: Optional[float] = None,
        version: Optional[int] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.balance = balance
        self.version = version


# ---- decimal helpers ----------------------------------------------------

def dec(value) -> Decimal:
    """A wire amount as a Decimal. Amounts arrive as strings ("150.00")."""
    if value is None or value == "":
        return Decimal("0")
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise WalletError(REQUEST_DECLINED, f"'{value}' is not a valid amount")


def money(value) -> float:
    """A wire amount as the float we store, rounded to 2 places."""
    return float(round(dec(value), 2))


def fmt(amount: float) -> str:
    """A stored amount as the decimal string the platform expects."""
    return f"{round(float(amount or 0.0), 2):.2f}"


# ---- balance version ----------------------------------------------------

_version_lock = threading.Lock()
_last_version = 0


def next_version() -> int:
    """A balance version: unix milliseconds, never repeating in this process.

    The spec allows a millisecond timestamp when the operator has no balance
    versioning of its own, and relies on it increasing, so two calls landing
    in the same millisecond must not tie.
    """
    global _last_version
    with _version_lock:
        now = int(time.time() * 1000)
        _last_version = now if now > _last_version else _last_version + 1
        return _last_version


# ---- lookups ------------------------------------------------------------

def find_session(db: Session, token: Optional[str]) -> Optional[CasinoSession]:
    if not token:
        return None
    return db.query(CasinoSession).filter(CasinoSession.player_session_token == token).first()


def session_is_live(session: Optional[CasinoSession]) -> bool:
    if not session or not session.is_active:
        return False
    return not session.expires_at or session.expires_at > datetime.utcnow()


def find_player(db: Session, player_id: str, session: Optional[CasinoSession] = None) -> User:
    """The client behind the platform's `player_id`.

    We send our username as `player_id` when we ask for a launch URL, so that
    is the canonical lookup; the session row is the fallback.
    """
    player_id = (player_id or "").strip()
    user = None
    if player_id:
        user = (
            db.query(User)
            .filter(func.upper(User.username) == player_id.upper(), User.role == CLIENT_ROLE)
            .first()
        )
    if not user and session and session.user_id:
        user = db.query(User).filter(User.id == session.user_id).first()
    if not user and player_id.isdigit():
        user = db.query(User).filter(User.client_id == int(player_id), User.role == CLIENT_ROLE).first()
    if not user:
        raise WalletError(REQUEST_DECLINED, f"Unknown player '{player_id}'")
    return user


def require_active(user: User, balance: Optional[float] = None, version: Optional[int] = None) -> None:
    if not user.is_active:
        raise WalletError(ACCOUNT_BLOCKED, "This account is blocked", balance, version)


def require_session(db: Session, token: Optional[str], user: User) -> CasinoSession:
    """The live session for this player, or TOKEN_EXPIRED.

    Used by the calls that only happen while the player is at the table
    (exposure updates, seamless debits). Settlement and rollback deliberately
    do not go through here: a round can settle long after the session is gone.
    """
    session = find_session(db, token)
    if not session:
        raise WalletError(TOKEN_EXPIRED, "Unknown player session token")
    if session.user_id != user.id:
        raise WalletError(REQUEST_DECLINED, "Player session token belongs to another player")
    if not session_is_live(session):
        raise WalletError(TOKEN_EXPIRED, "Player session token has expired")
    session.last_seen_at = datetime.utcnow()
    return session


# ---- exposure and balance ----------------------------------------------

def casino_exposure(db: Session, user_ids: Iterable[int]) -> dict[int, float]:
    """Exposure still held on live casino rounds, per user."""
    ids = list(user_ids)
    if not ids:
        return {}
    rows = (
        db.query(CasinoRoundExposure.user_id, func.sum(CasinoRoundExposure.exposure))
        .filter(CasinoRoundExposure.user_id.in_(ids), CasinoRoundExposure.is_open == True)  # noqa: E712
        .group_by(CasinoRoundExposure.user_id)
        .all()
    )
    return {uid: round(total or 0.0, 2) for uid, total in rows}


def user_casino_exposure(db: Session, user: User, exclude_round: Optional[int] = None) -> float:
    q = db.query(func.sum(CasinoRoundExposure.exposure)).filter(
        CasinoRoundExposure.user_id == user.id,
        CasinoRoundExposure.is_open == True,  # noqa: E712
    )
    if exclude_round is not None:
        q = q.filter(CasinoRoundExposure.round_id != exclude_round)
    return round(q.scalar() or 0.0, 2)


def sports_exposure(db: Session, user: User) -> float:
    """Only the sports book's share.

    Deliberately not `user_exposure`, which already folds the casino exposure
    in — we add our own below, and counting it twice would under-report the
    balance to the platform.
    """
    # Imported here, not at module level: betting.py asks us for the casino
    # exposure in return, so each module stays independent at import time.
    from app.services.exchange.betting import user_sports_exposure

    return user_sports_exposure(db, user)


def available_balance(db: Session, user: User, exclude_round: Optional[int] = None) -> float:
    """What the player can actually use: balance less everything held.

    This is the figure we report to the platform, so the exposure it holds has
    already been subtracted, as the spec requires.
    """
    # The session runs with autoflush off, and this mixes the balance held in
    # memory with exposure totals read back by SQL. Without the flush a hold
    # released moments ago is still counted and we under-report the balance.
    db.flush()
    balance = round(user.balance or 0.0, 2)
    held = sports_exposure(db, user) + user_casino_exposure(db, user, exclude_round=exclude_round)
    return round(balance - held, 2)


def balance_payload(db: Session, user: User) -> tuple[float, int]:
    return available_balance(db, user), next_version()


# ---- transaction log / idempotency -------------------------------------

def existing_transaction(db: Session, transaction_id: str) -> Optional[CasinoTransaction]:
    if not transaction_id:
        return None
    return (
        db.query(CasinoTransaction)
        .filter(CasinoTransaction.transaction_id == transaction_id)
        .first()
    )


def log_transaction(
    db: Session,
    *,
    transaction_id: str,
    kind: str,
    user: User,
    player_id: str,
    amount: float,
    balance_after: float,
    version: int,
    request_id: Optional[str] = None,
    sw_bet_transaction_id: Optional[str] = None,
    round_id: Optional[int] = None,
    game_id: Optional[int] = None,
    game_name: Optional[str] = None,
    agent_id: Optional[int] = None,
    payload: Optional[dict] = None,
) -> CasinoTransaction:
    tx = CasinoTransaction(
        transaction_id=transaction_id,
        request_id=request_id,
        sw_bet_transaction_id=sw_bet_transaction_id,
        kind=kind,
        user_id=user.id,
        player_id=player_id,
        username=user.username,
        domain=user.domain,
        round_id=round_id,
        game_id=game_id,
        game_name=game_name,
        agent_id=agent_id,
        amount=round(amount, 2),
        balance_after=round(balance_after, 2),
        version=version,
        payload=json.dumps(payload, default=str)[:60000] if payload else None,
        created_at=datetime.utcnow(),
    )
    db.add(tx)
    return tx


def write_statement(
    db: Session,
    user: User,
    amount: float,
    description: str,
    entry_type: str = "Profit & Loss",
) -> None:
    """One row in the player's A/C statement, tagged as Casino."""
    now = datetime.utcnow()
    db.add(
        AccountStatement(
            site_user=f"{user.username} ({user.domain})",
            domain=user.domain,
            username=user.username,
            date=now,
            event_type="Casino",
            amount=round(amount, 2),
            total=round(amount, 2),
            balance=round(user.balance or 0.0, 2),
            type=entry_type,
            dc="Credit" if amount >= 0 else "Debit",
            description=description[:500],
            created_at=now,
        )
    )


def lock_user(db: Session, user: User) -> User:
    """Re-read the client row locked, so two wallet calls can't spend the
    same balance (the same guard `place_bet` uses)."""
    return db.query(User).filter(User.id == user.id).with_for_update().one()


# ---- bets -------------------------------------------------------------

def _parse_dt(value) -> Optional[datetime]:
    if not value:
        return None
    text = str(value).replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text).replace(tzinfo=None)
    except ValueError:
        return None


def record_bets(
    db: Session,
    user: User,
    player_id: str,
    bets: Iterable,
    *,
    settled: bool = False,
) -> None:
    """Upsert the bets the platform reported, for the casino report and audit.

    Never raises: a bad bet row must not stop money that is otherwise fine
    from moving, and the amounts we act on come from the request body, not
    from here.
    """
    # Rows added in this call are not queryable until the flush, and the
    # platform can repeat a bet across `accepted_bets` and `new_bets`, so
    # track them here rather than risk a duplicate key at commit time.
    added: dict[str, CasinoBet] = {}
    for b in bets or []:
        try:
            bet_id = str(getattr(b, "id", "") or "")
            if not bet_id:
                continue
            row = added.get(bet_id) or db.query(CasinoBet).filter(CasinoBet.bet_id == bet_id).first()
            if not row:
                row = CasinoBet(bet_id=bet_id, player_id=player_id, round_id=getattr(b, "round_id", 0) or 0)
                db.add(row)
                added[bet_id] = row
            row.user_id = user.id
            row.username = user.username
            row.domain = user.domain
            row.transaction_id = getattr(b, "transaction_id", None) or row.transaction_id
            row.round_id = getattr(b, "round_id", None) or row.round_id
            row.game_id = getattr(b, "game_id", None)
            row.game_name = getattr(b, "game_name", None)
            row.agent_id = getattr(b, "agent_id", None)
            row.selection_id = getattr(b, "selection_id", None)
            row.selection_name = getattr(b, "selection_name", None)
            row.side = getattr(b, "type", None)
            row.odds = money(getattr(b, "odds", 0))
            row.stake = money(getattr(b, "amount", 0))
            row.exposure = money(getattr(b, "exposure", 0))
            row.currency_code = getattr(b, "currency_code", None)
            row.ip = getattr(b, "ip", None)
            row.placed_at = _parse_dt(getattr(b, "inserted_at", None)) or row.placed_at or datetime.utcnow()

            outcome = getattr(b, "outcome", None)
            if settled:
                row.pl = money(getattr(b, "pl", 0))
                row.outcome = outcome
                row.status = "void" if outcome in ("VOIDED", "CANCELLED") else "settled"
                row.settled_at = _parse_dt(getattr(b, "updated_at", None)) or datetime.utcnow()
            else:
                status = (getattr(b, "status", "") or "").upper()
                row.status = "void" if status == "DELETED" else "open"
        except Exception:  # pragma: no cover - audit only
            logger.exception("Could not record casino bet %s", getattr(b, "id", "?"))


# =======================================================================
#  Exposure wallet
# =======================================================================

def get_balance(db: Session, player_id: str, token: Optional[str]) -> tuple[float, int]:
    """GET /accounts/balance/{player_id}.

    Deliberately works with a missing or expired session token: a round can
    settle outside the life of a player session, and the platform polls this
    on a schedule.
    """
    session = find_session(db, token)
    user = find_player(db, player_id, session)
    balance, version = balance_payload(db, user)
    require_active(user, balance, version)
    if session:
        session.last_seen_at = datetime.utcnow()
        db.commit()
    return balance, version


def update_exposure(db: Session, req, token: Optional[str]) -> tuple[float, int]:
    """POST /accounts/exposure — hold the player's worst case for a round.

    All of `new_bets` is accepted or none of it is, which is what the platform
    requires. A request carrying a version we have already seen (or an older
    one) is discarded and the current balance is returned.
    """
    session = find_session(db, token)
    user = find_player(db, req.player_id, session)
    balance, version = balance_payload(db, user)
    require_active(user, balance, version)
    require_session(db, token, user)

    # The platform reports the worst case as a negative number; we hold what
    # the player stands to lose.
    wanted = dec(req.exposure)
    hold = float(round(-wanted, 2)) if wanted < 0 else 0.0

    user = lock_user(db, user)
    row = (
        db.query(CasinoRoundExposure)
        .filter(
            CasinoRoundExposure.player_id == req.player_id,
            CasinoRoundExposure.round_id == req.round_id,
        )
        .with_for_update()
        .first()
    )

    # Stale or replayed update: keep what we have (spec: do not update the
    # exposure or the version), just answer with the current balance.
    if row and row.version >= req.version:
        db.commit()
        balance, version = balance_payload(db, user)
        return balance, version

    # Everything else this player has at risk, this round excluded
    other_held = sports_exposure(db, user) + user_casino_exposure(db, user, exclude_round=req.round_id)
    free = round((user.balance or 0.0) - other_held, 2)
    if hold > free + 1e-9:
        db.rollback()
        balance, version = balance_payload(db, user)
        raise WalletError(
            INSUFFICIENT_FUNDS,
            f"Insufficient funds to hold exposure of {fmt(hold)} (available {fmt(free)})",
            balance,
            version,
        )

    now = datetime.utcnow()
    if not row:
        row = CasinoRoundExposure(
            user_id=user.id,
            player_id=req.player_id,
            round_id=req.round_id,
            created_at=now,
        )
        db.add(row)
    row.username = user.username
    row.domain = user.domain
    row.game_id = req.game_id
    row.game_name = getattr(req, "game_name", None)
    row.agent_id = req.agent_id
    row.exposure = hold
    row.version = req.version
    row.is_open = True
    row.settled_at = None
    row.updated_at = now
    if req.exposure_by_selections:
        row.exposure_by_selections = json.dumps(req.exposure_by_selections)

    # The platform may re-send bets we already hold (its request timed out and
    # it retried), so recording them is an upsert on the platform's bet id.
    record_bets(db, user, req.player_id, list(req.accepted_bets) + list(req.new_bets))

    try:
        db.commit()
    except IntegrityError:
        # Two exposure updates for the same round raced; the other one won.
        db.rollback()
        balance, version = balance_payload(db, user)
        return balance, version

    balance, version = balance_payload(db, user)
    return balance, version


def settle_player(db: Session, item, round_id: int, game_id: int) -> tuple[str, float, int]:
    """One player's settlement out of POST /accounts/settlement.

    Releases the hold for the round and applies `pl` to the balance, once,
    keyed on `transaction_id`. Applies even if the balance goes negative.
    """
    session = find_session(db, getattr(item, "player_session_token", None))
    user = find_player(db, item.player_id, session)

    done = existing_transaction(db, item.transaction_id)
    if done:
        # Already applied: answer with the current balance, don't move money.
        balance, version = balance_payload(db, user)
        return user.username, balance, version

    pl = money(item.pl)
    user = lock_user(db, user)

    row = (
        db.query(CasinoRoundExposure)
        .filter(
            CasinoRoundExposure.player_id == item.player_id,
            CasinoRoundExposure.round_id == (item.round_id or round_id),
        )
        .with_for_update()
        .first()
    )
    if row:
        # Release the hold. Nothing ever left the balance for it, so the money
        # comes back simply by closing the row.
        row.is_open = False
        row.exposure = 0.0
        row.settled_at = datetime.utcnow()

    user.balance = round((user.balance or 0.0) + pl, 2)

    game = getattr(item, "game_name", None) or f"Game {item.game_id or game_id}"
    write_statement(
        db,
        user,
        pl,
        f"Casino / {game} / Round {item.round_id or round_id} / "
        f"{'Win' if pl >= 0 else 'Loss'} {fmt(abs(pl))}",
    )
    record_bets(db, user, item.player_id, item.bets, settled=True)

    balance = available_balance(db, user)
    version = next_version()
    log_transaction(
        db,
        transaction_id=item.transaction_id,
        kind="SETTLEMENT",
        user=user,
        player_id=item.player_id,
        amount=pl,
        balance_after=balance,
        version=version,
        request_id=item.request_id,
        round_id=item.round_id or round_id,
        game_id=item.game_id or game_id,
        game_name=getattr(item, "game_name", None),
        agent_id=item.agent_id,
        payload=item.model_dump(mode="json"),
    )
    return user.username, balance, version


def rollback_player(db: Session, item, round_id: int, game_id: int) -> tuple[str, float, int]:
    """One player's rollback + resettlement out of POST /accounts/rollback.

    Two independent legs, each with its own idempotency key:
      `rollback_transaction_id` reverses the old settlement with `rollback_pl`
      `transaction_id`          applies the new result with `pl`
    Either may already have been applied, so they are checked separately.
    """
    user = find_player(db, item.player_id)

    rollback_done = existing_transaction(db, item.rollback_transaction_id)
    resettle_done = existing_transaction(db, item.transaction_id)
    if rollback_done and resettle_done:
        balance, version = balance_payload(db, user)
        return user.username, balance, version

    rollback_pl = money(item.rollback_pl)
    pl = money(item.pl)
    game = getattr(item, "game_name", None) or f"Game {item.game_id or game_id}"
    rid = item.round_id or round_id

    user = lock_user(db, user)

    if not rollback_done:
        user.balance = round((user.balance or 0.0) + rollback_pl, 2)
        write_statement(
            db,
            user,
            rollback_pl,
            f"Casino rollback / {game} / Round {rid} / reversed {fmt(abs(rollback_pl))}",
        )
        log_transaction(
            db,
            transaction_id=item.rollback_transaction_id,
            kind="ROLLBACK",
            user=user,
            player_id=item.player_id,
            amount=rollback_pl,
            balance_after=available_balance(db, user),
            version=next_version(),
            request_id=item.request_id,
            round_id=rid,
            game_id=item.game_id or game_id,
            agent_id=item.agent_id,
            payload=item.model_dump(mode="json"),
        )

    if not resettle_done:
        user.balance = round((user.balance or 0.0) + pl, 2)
        write_statement(
            db,
            user,
            pl,
            f"Casino resettlement / {game} / Round {rid} / "
            f"{'Win' if pl >= 0 else 'Loss'} {fmt(abs(pl))}",
        )
        log_transaction(
            db,
            transaction_id=item.transaction_id,
            kind="RESETTLEMENT",
            user=user,
            player_id=item.player_id,
            amount=pl,
            balance_after=available_balance(db, user),
            version=next_version(),
            request_id=item.request_id,
            round_id=rid,
            game_id=item.game_id or game_id,
            agent_id=item.agent_id,
            payload=item.model_dump(mode="json"),
        )

    # A resettled round is finished; make sure nothing stays held for it.
    row = (
        db.query(CasinoRoundExposure)
        .filter(
            CasinoRoundExposure.player_id == item.player_id,
            CasinoRoundExposure.round_id == rid,
        )
        .first()
    )
    if row and row.is_open:
        row.is_open = False
        row.exposure = 0.0
        row.settled_at = datetime.utcnow()

    record_bets(db, user, item.player_id, item.bets, settled=True)
    return user.username, available_balance(db, user), next_version()


# =======================================================================
#  Seamless wallet
# =======================================================================

def seamless_debit(db: Session, req, token: Optional[str]) -> tuple[float, int]:
    """POST /accounts/transactions/debit — take the stake now."""
    session = find_session(db, token)
    user = find_player(db, req.player_id, session)

    done = existing_transaction(db, req.transaction_id)
    if done:
        balance, version = balance_payload(db, user)
        return balance, version

    balance, version = balance_payload(db, user)
    require_active(user, balance, version)
    require_session(db, token, user)

    amount = money(req.amount)
    if amount < 0:
        raise WalletError(REQUEST_DECLINED, "A debit amount cannot be negative")

    user = lock_user(db, user)
    free = round((user.balance or 0.0) - sports_exposure(db, user) - user_casino_exposure(db, user), 2)
    if amount > free + 1e-9:
        db.rollback()
        balance, version = balance_payload(db, user)
        raise WalletError(
            INSUFFICIENT_FUNDS,
            f"Insufficient funds to debit {fmt(amount)} (available {fmt(free)})",
            balance,
            version,
        )

    user.balance = round((user.balance or 0.0) - amount, 2)
    game = req.game_name or f"Game {req.game_id}"
    write_statement(
        db,
        user,
        -amount,
        f"Casino bet / {game} / Round {req.round_id} / stake {fmt(amount)}",
    )
    record_bets(db, user, req.player_id, list(req.accepted_bets) + list(req.new_bets))

    balance = available_balance(db, user)
    version = next_version()
    log_transaction(
        db,
        transaction_id=req.transaction_id,
        kind="DEBIT",
        user=user,
        player_id=req.player_id,
        amount=-amount,
        balance_after=balance,
        version=version,
        request_id=req.request_id,
        round_id=req.round_id,
        game_id=req.game_id,
        game_name=req.game_name,
        agent_id=req.agent_id,
        payload=req.model_dump(mode="json"),
    )
    db.commit()
    return available_balance(db, user), version


def seamless_credit(db: Session, req, token: Optional[str]) -> tuple[float, int]:
    """POST /accounts/transactions/credit — pay the settlement.

    `amount` may be 0.00, which is how the platform confirms a round the
    player lost outright.
    """
    session = find_session(db, token)
    user = find_player(db, req.player_id, session)

    done = existing_transaction(db, req.transaction_id)
    if done:
        balance, version = balance_payload(db, user)
        return balance, version

    amount = money(req.amount)
    if amount < 0:
        raise WalletError(REQUEST_DECLINED, "A credit amount cannot be negative")

    user = lock_user(db, user)
    user.balance = round((user.balance or 0.0) + amount, 2)

    game = req.game_name or f"Game {req.game_id}"
    write_statement(
        db,
        user,
        amount,
        f"Casino payout / {game} / Round {req.round_id} / {fmt(amount)}",
    )
    record_bets(db, user, req.player_id, req.bets, settled=True)

    balance = available_balance(db, user)
    version = next_version()
    log_transaction(
        db,
        transaction_id=req.transaction_id,
        kind="CREDIT",
        user=user,
        player_id=req.player_id,
        amount=amount,
        balance_after=balance,
        version=version,
        request_id=req.request_id,
        sw_bet_transaction_id=req.sw_bet_transaction_id,
        round_id=req.round_id,
        game_id=req.game_id,
        game_name=req.game_name,
        agent_id=req.agent_id,
        payload=req.model_dump(mode="json"),
    )
    db.commit()
    return available_balance(db, user), version


def seamless_rollback(db: Session, req, token: Optional[str]) -> tuple[float, int]:
    """POST /accounts/transactions/rollback — give a debited stake back.

    Must work with a missing or expired `Player-Session-ID`: a rollback can
    arrive after the session is gone.
    """
    session = find_session(db, token)
    user = find_player(db, req.player_id, session)

    done = existing_transaction(db, req.transaction_id)
    if done:
        balance, version = balance_payload(db, user)
        return balance, version

    amount = money(req.amount)
    user = lock_user(db, user)
    user.balance = round((user.balance or 0.0) + amount, 2)

    game = req.game_name or f"Game {req.game_id}"
    write_statement(
        db,
        user,
        amount,
        f"Casino rollback / {game} / Round {req.round_id} / returned {fmt(amount)}",
    )

    # The bets of the debit being rolled back are no longer live.
    for row in (
        db.query(CasinoBet)
        .filter(CasinoBet.transaction_id == req.sw_bet_transaction_id)
        .all()
    ):
        row.status = "void"
        row.outcome = "CANCELLED"
        row.settled_at = datetime.utcnow()

    balance = available_balance(db, user)
    version = next_version()
    log_transaction(
        db,
        transaction_id=req.transaction_id,
        kind="ROLLBACK",
        user=user,
        player_id=req.player_id,
        amount=amount,
        balance_after=balance,
        version=version,
        request_id=req.request_id,
        sw_bet_transaction_id=req.sw_bet_transaction_id,
        round_id=req.round_id,
        game_id=req.game_id,
        game_name=req.game_name,
        agent_id=req.agent_id,
        payload=req.model_dump(mode="json"),
    )
    db.commit()
    return available_balance(db, user), version


# ---- sessions ---------------------------------------------------------

def open_session(
    db: Session,
    user: User,
    *,
    token: str,
    player_id: str,
    game_id: Optional[int] = None,
    game_name: Optional[str] = None,
    currency: Optional[str] = None,
    launch_url: Optional[str] = None,
) -> CasinoSession:
    """Record the player session token the platform will quote back to us."""
    now = datetime.utcnow()
    row = db.query(CasinoSession).filter(CasinoSession.player_session_token == token).first()
    if not row:
        row = CasinoSession(player_session_token=token, created_at=now)
        db.add(row)
    row.user_id = user.id
    row.player_id = player_id
    row.username = user.username
    row.domain = user.domain
    row.game_id = game_id
    row.game_name = game_name
    row.currency = (currency or settings.CASINO_CURRENCY).upper()[:3]
    row.launch_url = launch_url
    row.is_active = True
    row.last_seen_at = now
    row.expires_at = now + timedelta(hours=max(1, settings.CASINO_SESSION_HOURS))
    db.commit()
    db.refresh(row)
    return row


def close_sessions(db: Session, user: User) -> int:
    """End this player's casino sessions, e.g. when the account is locked."""
    rows = (
        db.query(CasinoSession)
        .filter(CasinoSession.user_id == user.id, CasinoSession.is_active == True)  # noqa: E712
        .all()
    )
    for row in rows:
        row.is_active = False
    db.commit()
    return len(rows)
