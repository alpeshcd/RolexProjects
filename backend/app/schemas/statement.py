from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StatementResponse(BaseModel):
    id: int
    site_user: str
    domain: Optional[str] = None
    username: str
    date: Optional[datetime] = None
    date_str: Optional[str] = None
    event_type: str
    amount: float
    total: float
    balance: float
    type: str
    dc: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SiteStatRow(BaseModel):
    id: int
    master_id: int
    username: str
    total_clients: int
    total_approved_deposit: float
    number_approved_deposit: int
    total_rejected_deposit: float
    number_rejected_deposit: int
    total_approved_withdraw: float
    number_approved_withdraw: int
    total_rejected_withdraw: float
    number_rejected_withdraw: int

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str
    otp_code: Optional[str] = None
