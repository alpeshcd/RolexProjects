from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from app.core.database import Base

class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(Integer, primary_key=True, index=True)
    deposit_id = Column(Integer, unique=True, index=True, nullable=False)
    site = Column(String(50), default="Mastan99")
    domain = Column(String(100), default="mastan99.com")
    username = Column(String(50), nullable=False, index=True)
    master = Column(String(50), default="MASTAN99M")
    added_by = Column(String(50), default="Client")
    account_id = Column(Integer, nullable=True)
    account_name = Column(String(100), nullable=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), default="Client")  # Client, Manual
    utr_number = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="Pending")  # Pending, Approved, Rejected
    proof_image_url = Column(String(255), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UTREntry(Base):
    __tablename__ = "utr_entries"

    id = Column(Integer, primary_key=True, index=True)
    utr_id = Column(Integer, unique=True, index=True, nullable=False)
    master = Column(String(50), default="MASTAN99M")
    added_by = Column(String(50), default="MASTAN99M")
    account_name = Column(String(100), nullable=False)
    utr_number = Column(String(50), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, REMOVED, MATCHED
    removed_by = Column(String(50), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
