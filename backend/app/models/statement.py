from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class AccountStatement(Base):
    __tablename__ = "account_statements"

    id = Column(Integer, primary_key=True, index=True)
    site_user = Column(String(100), index=True, default="Mastan777 (mastan247.club)")
    domain = Column(String(100), default="mastan247.club")
    username = Column(String(50), index=True, default="Mastan777")
    date = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String(50), default="-")  # Tennis, Cricket, -, Casino
    amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    type = Column(String(50), default="Profit & Loss")  # Profit & Loss, Withdraw, Deposit
    dc = Column(String(10), default="Credit")  # Credit, Debit
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
