from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    withdrawal_id = Column(Integer, unique=True, index=True, nullable=False)
    
    site = Column(String(100), default="Mastan99")
    domain = Column(String(100), default="mastan99.com")
    username = Column(String(50), index=True, nullable=False)
    master = Column(String(50), default="MASTAN99M")
    added_by = Column(String(50), default="Client")
    
    # Destination Bank Account Details
    account_name = Column(String(150), nullable=True)
    account_no = Column(String(100), nullable=True)
    ifsc_code = Column(String(50), nullable=True)
    bank_name = Column(String(100), nullable=True)
    
    amount = Column(Float, nullable=False, default=0.0)
    type = Column(String(50), default="Client")  # Client, Manual
    utr_number = Column(String(100), nullable=True, default=None)
    status = Column(String(50), default="Pending", index=True)  # Pending, Approved, Rejected, Canceled
    rejection_reason = Column(String(255), nullable=True)
    
    # Timestamps
    date = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
