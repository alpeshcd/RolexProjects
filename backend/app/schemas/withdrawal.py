from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WithdrawalBase(BaseModel):
    site: Optional[str] = "Mastan99"
    domain: Optional[str] = "mastan99.com"
    username: str
    master: Optional[str] = "MASTAN99M"
    added_by: Optional[str] = None
    account_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    amount: float
    type: Optional[str] = "Client"
    utr_number: Optional[str] = None

class WithdrawalCreate(WithdrawalBase):
    pass

class WithdrawalApprovePayload(BaseModel):
    utr_number: str

class WithdrawalRejectPayload(BaseModel):
    reason: Optional[str] = "Account details mismatch / Bank server down"

class WithdrawalResponse(BaseModel):
    id: int
    withdrawal_id: int
    site: str
    domain: Optional[str] = None
    username: str
    master: str
    added_by: Optional[str] = None
    account_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    amount: float
    type: str
    utr_number: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    date: Optional[datetime] = None
    date_str: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_at_str: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejected_at_str: Optional[str] = None
    canceled_at: Optional[datetime] = None
    canceled_at_str: Optional[str] = None

    class Config:
        from_attributes = True
