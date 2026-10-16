from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str = "client"
    balance: float = 0.0
    upline_share: float = 0.0
    upline: Optional[str] = None
    domain: Optional[str] = None
    client_id: Optional[int] = None
    mobile: Optional[str] = "-"
    master: Optional[str] = "MASTAN99M"
    site: Optional[str] = "Mastan99"
    deposit_count: int = 0
    source: str = "Manual"
    referral_code: Optional[str] = None
    is_2fa_enabled: bool = False

class UserCreate(UserBase):
    password: str

class ClientCreateRequest(BaseModel):
    master: str
    referral_code: Optional[str] = None
    username: str
    password: str
    mobile: Optional[str] = "-"
    balance: Optional[float] = 0.0

class UserUpdateBalance(BaseModel):
    amount: float = Field(gt=0)
    operation: Literal["deposit", "withdraw"] = "deposit"

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserDetail(UserBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    created_on: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StatsSummary(BaseModel):
    total_clients: int
    total_balance: float
    total_upline_share: float
    active_clients: int
