from pydantic import BaseModel, ConfigDict
from typing import Optional

class DashboardStatsResponse(BaseModel):
    new_clients: int
    total_ftd: float
    total_ftd_count: int
    
    total_deposits: float
    total_deposits_count: int
    approved_deposits: float
    approved_deposits_count: int
    rejected_deposits: float
    rejected_deposits_count: int
    
    total_withdrawals: float
    total_withdrawals_count: int
    pending_withdrawals: float
    pending_withdrawals_count: int
    approved_withdrawals: float
    approved_withdrawals_count: int
    rejected_withdrawals: float
    rejected_withdrawals_count: int

    model_config = ConfigDict(from_attributes=True)

class DashboardStatsUpdate(BaseModel):
    new_clients: Optional[int] = None
    total_ftd: Optional[float] = None
    total_deposits: Optional[float] = None
    approved_deposits: Optional[float] = None
    rejected_deposits: Optional[float] = None
    total_withdrawals: Optional[float] = None
    pending_withdrawals: Optional[float] = None
    approved_withdrawals: Optional[float] = None
    rejected_withdrawals: Optional[float] = None
