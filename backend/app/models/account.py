from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from app.core.database import Base

class BankAccount(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(50), default="MASTAN99M", index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), default="UPI")  # UPI, BANK, QR
    category = Column(String(50), default="No Category")
    account_number = Column(String(100), nullable=False, index=True)  # UPI ID or Bank A/C No
    ifsc_code = Column(String(30), nullable=True)
    bank_name = Column(String(100), nullable=True)
    min_amount = Column(Float, default=100.0)
    max_amount = Column(Float, default=20000.0)
    max_deposit = Column(String(50), default="Both")
    account_for = Column(String(50), default="Deposit")  # Deposit, Withdraw, Both
    is_only_withdrawal = Column(Boolean, default=False)
    qr_code_url = Column(String(255), nullable=True)
    status = Column(String(20), default="Inactive")  # Active, Inactive
    is_active = Column(Boolean, default=False)
    last_update = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
