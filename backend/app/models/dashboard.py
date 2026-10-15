from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from app.core.database import Base

class DashboardStat(Base):
    __tablename__ = "dashboard_stats"

    id = Column(Integer, primary_key=True, index=True)
    new_clients = Column(Integer, default=12)
    total_ftd = Column(Float, default=0.0)
    total_ftd_count = Column(Integer, default=0)
    
    total_deposits = Column(Float, default=76720.0)
    total_deposits_count = Column(Integer, default=59)
    approved_deposits = Column(Float, default=59120.0)
    approved_deposits_count = Column(Integer, default=37)
    rejected_deposits = Column(Float, default=17600.0)
    rejected_deposits_count = Column(Integer, default=22)
    
    total_withdrawals = Column(Float, default=182810.0)
    total_withdrawals_count = Column(Integer, default=24)
    pending_withdrawals = Column(Float, default=7000.0)
    pending_withdrawals_count = Column(Integer, default=1)
    approved_withdrawals = Column(Float, default=147283.0)
    approved_withdrawals_count = Column(Integer, default=17)
    rejected_withdrawals = Column(Float, default=28527.0)
    rejected_withdrawals_count = Column(Integer, default=6)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
