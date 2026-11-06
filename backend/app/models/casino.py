"""Live casino tables: player sessions, held exposure, and wallet transactions.

The platform (the client's Live Casino provider) calls our wallet endpoints to
hold exposure, settle rounds and roll settlements back. Everything it sends
that moves money lands in one of these tables:

CasinoSession      the `player_session_token` the platform quotes back to us in
                   the `Player-Session-ID` header, mapped to one of our clients.
CasinoRoundExposure the exposure currently held for one player on one round,
                   with the platform's version so stale updates are ignored.
CasinoTransaction  every applied debit/credit, keyed by the platform's
                   `transaction_id` so a replay can never move money twice.
CasinoBet          the bets the platform reports with each round, kept for the
                   panel's casino report and for reconciliation.
"""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)

from app.core.database import Base


class CasinoSession(Base):
    """One player's live casino session.

    Created when the player opens a table (POST /launch-url upstream). The
    platform sends `player_session_token` back to us in the `Player-Session-ID`
    header on every wallet call, which is how we know whose balance to move.
    """
    __tablename__ = "casino_sessions"

    id = Column(Integer, primary_key=True, index=True)
    # The token the platform quotes back to us
    player_session_token = Column(String(255), unique=True, index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    # `player_id` as the platform knows it. We send our username so the
    # platform's player_id and ours never drift.
    player_id = Column(String(36), index=True, nullable=False)
    username = Column(String(50), index=True, nullable=False)
    domain = Column(String(100), index=True, nullable=True)

    game_id = Column(Integer, nullable=True)
    game_name = Column(String(100), nullable=True)
    currency = Column(String(3), default="INR")
    launch_url = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)


class CasinoRoundExposure(Base):
    """Exposure held for one player on one round (exposure wallet model).

    Nothing leaves the balance while a round is live; the worst case the
    platform reports is held back from what the player can bet or withdraw,
    exactly like our own sports book. Released at settlement.
    """
    __tablename__ = "casino_round_exposures"
    __table_args__ = (
        UniqueConstraint("player_id", "round_id", name="uq_casino_exposure_player_round"),
        Index("ix_casino_exposure_open", "user_id", "is_open"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    player_id = Column(String(36), index=True, nullable=False)
    username = Column(String(50), index=True, nullable=True)
    domain = Column(String(100), index=True, nullable=True)

    round_id = Column(Integer, index=True, nullable=False)
    game_id = Column(Integer, nullable=True)
    game_name = Column(String(100), nullable=True)
    agent_id = Column(Integer, nullable=True)

    # Held amount, always stored positive. The platform sends `exposure` as a
    # negative number (the player's worst case), we store what we hold back.
    exposure = Column(Float, default=0.0, nullable=False)
    # The platform's exposure version. An update carrying a version at or below
    # this one is discarded (spec: "do not update the exposure or version").
    version = Column(Integer, default=0, nullable=False)
    exposure_by_selections = Column(Text, nullable=True)  # JSON as received

    is_open = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    settled_at = Column(DateTime, nullable=True)


class CasinoTransaction(Base):
    """One applied wallet movement, keyed by the platform's transaction id.

    `transaction_id` is unique, which is what makes every wallet endpoint
    idempotent: a replay finds the row and returns the stored balance instead
    of moving money again.
    """
    __tablename__ = "casino_transactions"
    __table_args__ = (
        UniqueConstraint("transaction_id", name="uq_casino_transaction_id"),
        Index("ix_casino_tx_player_round", "player_id", "round_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    request_id = Column(String(64), index=True, nullable=True)
    # The DEBIT this credit/rollback refers to (seamless `sw_bet_transaction_id`)
    sw_bet_transaction_id = Column(String(64), index=True, nullable=True)

    # DEBIT, CREDIT, SETTLEMENT, ROLLBACK, RESETTLEMENT
    kind = Column(String(20), index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    player_id = Column(String(36), index=True, nullable=False)
    username = Column(String(50), index=True, nullable=True)
    domain = Column(String(100), index=True, nullable=True)

    round_id = Column(Integer, index=True, nullable=True)
    game_id = Column(Integer, nullable=True)
    game_name = Column(String(100), nullable=True)
    agent_id = Column(Integer, nullable=True)

    # Signed amount actually applied to the balance (+credit / -debit)
    amount = Column(Float, default=0.0, nullable=False)
    balance_after = Column(Float, default=0.0, nullable=False)
    version = Column(Integer, default=0, nullable=False)  # balance version we returned
    payload = Column(Text, nullable=True)  # the request as received, for audit

    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class CasinoBet(Base):
    """A bet the platform reported on a casino round.

    Mirrors `bets` (our sports book) closely enough that the panel can list
    casino and sports action side by side.
    """
    __tablename__ = "casino_bets"
    __table_args__ = (
        UniqueConstraint("bet_id", name="uq_casino_bet_id"),
        Index("ix_casino_bets_user_round", "user_id", "round_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    bet_id = Column(String(32), unique=True, index=True, nullable=False)  # platform bet id
    transaction_id = Column(String(64), index=True, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    player_id = Column(String(36), index=True, nullable=False)
    username = Column(String(50), index=True, nullable=True)
    domain = Column(String(100), index=True, nullable=True)

    round_id = Column(Integer, index=True, nullable=False)
    game_id = Column(Integer, nullable=True)
    game_name = Column(String(100), nullable=True)
    agent_id = Column(Integer, nullable=True)

    selection_id = Column(String(100), nullable=True)
    selection_name = Column(String(100), nullable=True)
    side = Column(String(4), nullable=True)  # BACK, LAY
    odds = Column(Float, default=0.0)
    stake = Column(Float, default=0.0)
    exposure = Column(Float, default=0.0)
    pl = Column(Float, default=0.0)

    status = Column(String(10), default="open", index=True)  # open, settled, void
    outcome = Column(String(12), nullable=True)  # WON, LOST, VOIDED, CANCELLED, DELETED
    currency_code = Column(String(3), nullable=True)
    ip = Column(String(45), nullable=True)

    placed_at = Column(DateTime, nullable=True)
    settled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
