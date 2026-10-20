from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
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
