from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from app.core.database import Base

class DomainPortal(Base):
    __tablename__ = "domain_portals"

    id = Column(Integer, primary_key=True, index=True)
    domain_key = Column(String(50), unique=True, index=True, nullable=False)
    domain_title = Column(String(100), nullable=False)
    domain_url = Column(String(100), nullable=False)
    brand_name = Column(String(100), nullable=False)
    balance = Column(Float, default=0.0)
    pl = Column(Float, default=0.0)
    client_wallet = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
