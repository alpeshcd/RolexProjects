from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PortalResponse(BaseModel):
    id: int
    domain_key: str
    domain_title: str
    domain_url: str
    brand_name: str
    balance: float
    pl: float
    client_wallet: float
    is_active: bool
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GlobalSearchClient(BaseModel):
    id: int
    s_no: Optional[int] = None
    domain: str
    domain_title: Optional[str] = None
    username: str
    full_name: Optional[str] = None
    balance: float
    last_updated: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class CreatePortalClient(BaseModel):
    domain: str
    username: str
    full_name: Optional[str] = None
    password: str
    balance: Optional[float] = 0.0
    upline: Optional[str] = "MASTAN99M"
    upline_share: Optional[float] = 0.0

class CreatePortal(BaseModel):
    domain_key: str
    domain_title: str
    domain_url: str
    brand_name: str
    balance: Optional[float] = 0.0
    pl: Optional[float] = 0.0
    client_wallet: Optional[float] = 0.0
    is_active: Optional[bool] = True

class UpdatePortal(BaseModel):
    domain_title: Optional[str] = None
    domain_url: Optional[str] = None
    brand_name: Optional[str] = None
    balance: Optional[float] = None
    pl: Optional[float] = None
    client_wallet: Optional[float] = None
    is_active: Optional[bool] = None

