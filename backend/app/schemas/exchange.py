from typing import Literal, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class PanelPortal(BaseModel):
    domain_key: str
    domain_url: str
    brand_name: str
    domain_title: str


class PanelLoginRequest(BaseModel):
    host: str
    username: str
    password: str


class PanelAccount(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str
    role_label: str
    domain_key: str
    balance: float
    upline: float
    exposure: float
    credit_reference: float
    partnership: float
    child_roles: list[str]
    created_at: Optional[datetime] = None


class PanelMe(BaseModel):
    account: PanelAccount
    portal: PanelPortal


class PanelLoginResponse(PanelMe):
    access_token: str
    token_type: str = "bearer"


class DownlineRow(BaseModel):
    kind: Literal["account", "client"]
    id: int
    username: str
    full_name: Optional[str] = None
    role: str
    role_label: str
    parent: Optional[str] = None
    credit_reference: float
    balance: float
    exposure: float
    available: float
    pl: float
    partnership: float
    is_active: bool
    created_at: Optional[datetime] = None


class DownlineCreate(BaseModel):
    role: Literal["supermaster", "master", "client"]
    username: str = Field(min_length=4, max_length=20, pattern=r"^[A-Za-z0-9_]+$")
    full_name: Optional[str] = None
    password: str = Field(min_length=6, max_length=50)
    credit_reference: float = Field(default=0.0, ge=0)
    partnership: float = Field(default=0.0, ge=0, le=100)
    mobile: Optional[str] = None


class ChipTransfer(BaseModel):
    action: Literal["deposit", "withdraw"]
    amount: float = Field(gt=0)
    remark: Optional[str] = Field(default=None, max_length=200)


class DownlineStatus(BaseModel):
    is_active: bool


class DownlinePassword(BaseModel):
    password: str = Field(min_length=6, max_length=50)


class PanelPasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=50)


class PanelStatementRow(BaseModel):
    id: int
    date: datetime
    counterparty: Optional[str] = None
    description: Optional[str] = None
    credit: float
    debit: float
    balance: float
