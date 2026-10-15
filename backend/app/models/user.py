from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="admin", nullable=False)
    
    # Financials for betting exchange
    balance = Column(Float, default=143418.0)
    upline_share = Column(Float, default=25589.0)
    upline = Column(String(50), default="MASTAN365")
    
    # 2FA Security
    is_active = Column(Boolean, default=True)
    is_2fa_enabled = Column(Boolean, default=True)
    totp_secret = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
