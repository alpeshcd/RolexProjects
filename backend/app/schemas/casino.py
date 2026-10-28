from typing import List, Optional
from pydantic import BaseModel

class CasinoTable(BaseModel):
    id: str
    name: str = ""
    category: str  # e.g. "teen_patti", "roulette", "andar_bahar", "baccarat", "dragon_tiger", "blackjack"
    provider: str  # e.g. "Evolution", "Ezugi", "Aura", "Super Spade", "Pragmatic"
    image: str
    min_bet: float = 100.0
    max_bet: float = 200000.0
    players_count: int = 150
    is_active: bool = True

class CasinoLaunchRequest(BaseModel):
    table_id: str
    provider: str = "Aura"

class CasinoLaunchResponse(BaseModel):
    table_id: str
    table_name: str
    launch_url: str
    token: Optional[str] = None
    provider: str
