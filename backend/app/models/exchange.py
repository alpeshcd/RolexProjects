from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, UniqueConstraint
from app.core.database import Base


class ExchangeAccount(Base):
    """Master-panel login (admin / super master / master) on a Mastan domain portal.

    Kept out of the `users` table so these accounts can never sign in to the
    Rolex admin. Clients stay in `users` (role "client"), linked to a portal by
    `User.domain` and to their master by `User.master`.
    """
    __tablename__ = "exchange_accounts"

    id = Column(Integer, primary_key=True, index=True)
    domain_key = Column(String(50), index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # admin, supermaster, master
    parent_id = Column(Integer, ForeignKey("exchange_accounts.id"), nullable=True, index=True)

    # The admin account's chips are the portal balance (DomainPortal.balance),
    # so the Rolex admin and the panel header show the same figure.
    balance = Column(Float, default=0.0)
    credit_reference = Column(Float, default=0.0)
    partnership = Column(Float, default=0.0)  # % share taken from the downline

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Bet(Base):
    """A player-site bet. The house takes the other side, so a bet is matched
    in full when it is accepted. Clients are `users` rows (role "client")."""
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    username = Column(String(50), index=True, nullable=False)
    domain = Column(String(100), index=True, nullable=False)

    event_id = Column(Integer, index=True, nullable=False)
    event_name = Column(String(200), nullable=False)
    sport_name = Column(String(50), nullable=True)
    market_id = Column(String(50), index=True, nullable=False)
    market_type = Column(String(20), nullable=False)  # match_odds, bookmaker
    market_name = Column(String(100), nullable=False)
    runners = Column(Text, nullable=False)  # JSON list of the market's runner names

    selection = Column(String(100), nullable=False)
    side = Column(String(4), nullable=False)  # back, lay
    odds = Column(Float, nullable=False)  # decimal odds; bookmaker rate 45 is stored as 1.45
    stake = Column(Float, nullable=False)
    # The player's profit/loss if `selection` wins, and if it loses
    win_amount = Column(Float, nullable=False)
    lose_amount = Column(Float, nullable=False)
    demo_odds = Column(Boolean, default=False)  # placed on mock prices

    status = Column(String(10), default="open", index=True)  # open, won, lost, void
    pl = Column(Float, default=0.0)  # settled profit/loss
    placed_at = Column(DateTime, default=datetime.utcnow)
    settled_at = Column(DateTime, nullable=True)


class MarketResult(Base):
    """A declared result. Settles every open bet on the market for one portal."""
    __tablename__ = "market_results"
    __table_args__ = (UniqueConstraint("domain_key", "market_id"),)

    id = Column(Integer, primary_key=True, index=True)
    domain_key = Column(String(50), index=True, nullable=False)
    market_id = Column(String(50), nullable=False)
    event_id = Column(Integer, nullable=False)
    event_name = Column(String(200), nullable=False)
    market_name = Column(String(100), nullable=False)
    winner = Column(String(100), nullable=False)  # runner name, or "VOID"
    bet_count = Column(Integer, default=0)
    declared_by = Column(String(50), nullable=False)
    declared_at = Column(DateTime, default=datetime.utcnow)


class ExchangeTransaction(Base):
    """One chip movement in a master-panel account's A/C statement."""
    __tablename__ = "exchange_transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("exchange_accounts.id"), index=True, nullable=False)
    counterparty = Column(String(50), nullable=True)
    dc = Column(String(10), nullable=False)  # Credit, Debit
    amount = Column(Float, nullable=False)
    balance = Column(Float, nullable=False)  # account balance after this entry
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
