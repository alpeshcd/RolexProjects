from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AccountBase(BaseModel):
    user: Optional[str] = "MASTAN99M"
    name: str
    type: str = "UPI"  # UPI, BANK, QR
    category: Optional[str] = "No Category"
    account_number: str
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    min_amount: float = 100.0
    max_amount: float = 20000.0
    max_deposit: Optional[str] = "Both"
    account_for: Optional[str] = "Deposit"
    is_only_withdrawal: Optional[bool] = False
    qr_code_url: Optional[str] = None
    status: str = "Inactive"
    is_active: bool = False

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    max_deposit: Optional[str] = None
    account_for: Optional[str] = None
    is_only_withdrawal: Optional[bool] = None
    qr_code_url: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: int
    last_update: Optional[datetime] = None
    last_update_str: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
