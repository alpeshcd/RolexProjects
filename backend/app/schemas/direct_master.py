from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- Party ----------

class PartyBase(BaseModel):
    name: str
    type: str = "All"  # Purchase, Seller, Third, All
    contact: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True


class PartyCreate(PartyBase):
    pass


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    contact: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class PartyResponse(PartyBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Third party commission rows ----------

class ThirdPartyIn(BaseModel):
    party_id: int
    commission: float = 0.0


class ThirdPartyResponse(BaseModel):
    id: int
    party_id: int
    party_name: Optional[str] = None
    commission: float

    model_config = ConfigDict(from_attributes=True)


# ---------- Direct Master ----------

class DirectMasterBase(BaseModel):
    exchange: str
    exchange_title: Optional[str] = None
    admin: str
    purchase_party_id: int
    purchase_rate: float
    seller_party_id: int
    seller_rate: float
    credit: Optional[float] = None
    status: str = "Active"


class DirectMasterCreate(DirectMasterBase):
    third_parties: List[ThirdPartyIn] = []


class DirectMasterUpdate(BaseModel):
    exchange: Optional[str] = None
    exchange_title: Optional[str] = None
    admin: Optional[str] = None
    purchase_party_id: Optional[int] = None
    purchase_rate: Optional[float] = None
    seller_party_id: Optional[int] = None
    seller_rate: Optional[float] = None
    credit: Optional[float] = None
    status: Optional[str] = None
    # When present, replaces the whole third-party list for this record.
    third_parties: Optional[List[ThirdPartyIn]] = None


class DirectMasterResponse(DirectMasterBase):
    id: int
    is_active: bool = True
    purchase_party_name: Optional[str] = None
    seller_party_name: Optional[str] = None
    third_parties: List[ThirdPartyResponse] = []

    # Derived — see ASSUMPTIONS note in the endpoint module
    spread: float = 0.0
    total_commission: float = 0.0
    net_spread: float = 0.0

    created_at: Optional[datetime] = None
    created_at_str: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
