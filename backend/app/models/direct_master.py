from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Party(Base):
    """Purchase / Seller / Third party master used by Direct Master records."""
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    # Purchase, Seller, Third, All -- "All" shows up in every dropdown
    type = Column(String(20), default="All", index=True)
    contact = Column(String(30), nullable=True)
    notes = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DirectMaster(Base):
    """One master account bought from a purchase party and given to a seller party."""
    __tablename__ = "direct_masters"

    id = Column(Integer, primary_key=True, index=True)
    exchange = Column(String(50), nullable=False, index=True)   # domain_key of the portal
    exchange_title = Column(String(100), nullable=True)         # readable label at time of entry
    admin = Column(String(100), nullable=False, index=True)     # master/admin username on the exchange

    purchase_party_id = Column(Integer, ForeignKey("parties.id"), nullable=False, index=True)
    purchase_rate = Column(Float, nullable=False, default=0.0)

    seller_party_id = Column(Integer, ForeignKey("parties.id"), nullable=False, index=True)
    seller_rate = Column(Float, nullable=False, default=0.0)

    credit = Column(Float, nullable=True)

    status = Column(String(20), default="Active")  # Active, Inactive
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    purchase_party = relationship("Party", foreign_keys=[purchase_party_id])
    seller_party = relationship("Party", foreign_keys=[seller_party_id])
    third_parties = relationship(
        "DirectMasterThirdParty",
        back_populates="direct_master",
        cascade="all, delete-orphan",
    )


class DirectMasterThirdParty(Base):
    """Broker / sub-agent sitting between the purchase and seller party, with their cut."""
    __tablename__ = "direct_master_third_parties"

    id = Column(Integer, primary_key=True, index=True)
    direct_master_id = Column(
        Integer, ForeignKey("direct_masters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    party_id = Column(Integer, ForeignKey("parties.id"), nullable=False, index=True)
    commission = Column(Float, nullable=False, default=0.0)  # percent
    created_at = Column(DateTime, default=datetime.utcnow)

    direct_master = relationship("DirectMaster", back_populates="third_parties")
    party = relationship("Party")
