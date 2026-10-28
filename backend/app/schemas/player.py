from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.exchange import PanelPortal


class PlayerLoginRequest(BaseModel):
    host: str
    username: str
    password: str


class PlayerAccount(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    balance: float
    exposure: float
    available: float
    master: Optional[str] = None


class PlayerMe(BaseModel):
    account: PlayerAccount
    portal: PanelPortal


class PlayerLoginResponse(PlayerMe):
    access_token: str
    token_type: str = "bearer"


class PlayerPasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=50)


class PlaceBetRequest(BaseModel):
    event_id: int
    market_type: Literal["match_odds", "bookmaker"]
    market_id: str = Field(max_length=50)
    selection: str = Field(max_length=100)
    side: Literal["back", "lay"]
    # Decimal odds; for Bookmaker the rate 45 is sent as 1.45
    odds: float = Field(gt=1)
    stake: int = Field(gt=0)


class BetRow(BaseModel):
    id: int
    client: str
    event_id: int
    event_name: str
    sport_name: Optional[str] = None
    market: str
    market_id: str
    market_name: str
    runner: str
    side: Literal["back", "lay"]
    rate: float
    run: Optional[float] = None
    stake: float
    pl: float
    liability: float
    status: str
    demo_odds: bool
    placed_at: datetime
    settled_at: Optional[datetime] = None


class PlaceBetResponse(BaseModel):
    bet: BetRow
    account: PlayerAccount


class PlayerStatementRow(BaseModel):
    id: int
    date: datetime
    type: Optional[str] = None
    description: Optional[str] = None
    credit: float
    debit: float
    balance: float


class PendingMarket(BaseModel):
    market_id: str
    market_type: str
    market_name: str
    event_id: int
    event_name: str
    sport_name: Optional[str] = None
    runners: list[str]
    bet_count: int
    total_stake: float
    book: dict[str, float]
    last_bet_at: datetime


class DeclareResult(BaseModel):
    market_id: str = Field(max_length=50)
    # A runner name, or "VOID" to cancel every bet on the market
    winner: str = Field(min_length=1, max_length=100)


class MarketResultRow(BaseModel):
    id: int
    market_id: str
    event_id: int
    event_name: str
    market_name: str
    winner: str
    bet_count: int
    declared_by: str
    declared_at: datetime

    class Config:
        from_attributes = True
