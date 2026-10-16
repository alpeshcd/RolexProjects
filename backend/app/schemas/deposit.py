from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class DepositCreate(BaseModel):
    username: str
    amount: float = Field(gt=0)
    utr_number: str
    account_name: Optional[str] = None
    account_id: Optional[int] = None
    proof_image_url: Optional[str] = None
    site: Optional[str] = None
    type: Optional[str] = "Client"

class DepositUpdateStatus(BaseModel):
    status: str  # "Approved" or "Rejected"
    reason: Optional[str] = None

class DepositResponse(BaseModel):
    id: int
    deposit_id: int
    site: str
    domain: Optional[str] = None
    username: str
    master: str
    added_by: str
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    amount: float
    type: str
    utr_number: str
    status: str
    proof_image_url: Optional[str] = None
    date: Optional[datetime] = None
    date_str: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_at_str: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejected_at_str: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UTREntryCreate(BaseModel):
    utr_number: str
    account_name: str
    amount: float = Field(gt=0)

class UTREntryResponse(BaseModel):
    id: int
    utr_id: int
    master: str
    added_by: str
    account_name: str
    utr_number: str
    amount: float
    status: str
    removed_by: Optional[str] = None
    date: Optional[datetime] = None
    date_str: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
