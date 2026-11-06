"""Live casino schemas.

Two groups:

* The catalog the player site reads (`CasinoTable`, `CasinoLaunch*`). These
  shapes are what `user-site` already renders, so they stay as they are
  whether the tables come from the demo catalog or the client's platform.

* The Operator wallet contract (everything from `BalanceResponse` down), i.e.
  the bodies the platform POSTs to us for exposure, settlement and rollback,
  and the bodies we must answer with. Field names and nesting follow the
  client's OpenAPI spec exactly.

Amounts are decimal strings on the wire ("150.00") to keep precision; the
wallet service parses them with `Decimal`. Descriptive bet fields are optional
so a missing label can never 422 a request that moves money — the amounts and
ids that matter are required.
"""
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

# ---- Player-site catalog -------------------------------------------------


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


# ---- Shared wallet pieces ------------------------------------------------

DecimalString = str


class BalanceResponse(BaseModel):
    """What every successful wallet call returns."""
    model_config = ConfigDict(extra="forbid")

    balance: DecimalString
    version: int


class OperatorWalletErrorResponse(BaseModel):
    """A declined wallet call. Always sent with HTTP 400.

    `code` is one of REQUEST_DECLINED, TOKEN_EXPIRED, INSUFFICIENT_FUNDS,
    ACCOUNT_BLOCKED, INVALID_API_KEY, UNKNOWN_ERROR.
    """
    code: str
    message: Optional[str] = None
    balance: Optional[DecimalString] = None
    version: Optional[int] = None


class PlayerBalanceResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    player_id: str
    balance: DecimalString
    version: int


class BatchBalanceResultResponse(BaseModel):
    results: List[PlayerBalanceResult]


class BatchErrorResponse(BaseModel):
    code: str
    message: Optional[str] = None
    results: Optional[List[PlayerBalanceResult]] = None


# ---- Bets the platform reports ------------------------------------------


class OperatorBet(BaseModel):
    """A bet as the platform sends it. Unknown extra fields are kept, not rejected."""
    model_config = ConfigDict(extra="allow")

    id: int
    amount: DecimalString
    exposure: DecimalString
    odds: DecimalString
    round_id: int
    game_id: int
    # Seamless only; the exposure wallet ignores it
    transaction_id: Optional[str] = None
    selection_id: Optional[str] = None
    selection_name: Optional[str] = None
    game_name: Optional[str] = None
    status: Optional[str] = None  # PENDING, ACCEPTED, SETTLED, DELETED
    type: Optional[str] = None  # BACK, LAY
    inserted_at: Optional[str] = None
    updated_at: Optional[str] = None
    ip: Optional[str] = None
    currency_code: Optional[str] = None
    agent_id: Optional[int] = None


class SettledBet(OperatorBet):
    """OperatorBet plus its result."""
    pl: DecimalString
    outcome: Optional[str] = None  # CANCELLED, LOST, VOIDED, WON, DELETED


# ---- Exposure wallet ----------------------------------------------------


class ExposureUpdateRequest(BaseModel):
    """POST /accounts/exposure — hold the player's worst case for a round."""
    model_config = ConfigDict(extra="allow")

    request_id: str
    player_id: str
    exposure: DecimalString
    version: int
    round_id: int
    game_id: int
    agent_id: Optional[int] = None
    new_bets: List[OperatorBet] = Field(default_factory=list)
    accepted_bets: List[OperatorBet] = Field(default_factory=list)
    exposure_by_selections: Dict[str, DecimalString] = Field(default_factory=dict)


class PlayerSettlement(BaseModel):
    model_config = ConfigDict(extra="allow")

    request_id: str
    transaction_id: str
    player_id: str
    exposure: DecimalString
    pl: DecimalString
    round_id: int
    game_id: int
    bets: List[SettledBet] = Field(default_factory=list)
    agent_id: Optional[int] = None
    player_session_token: Optional[str] = None
    exposure_by_selections: Dict[str, DecimalString] = Field(default_factory=dict)


class SettlementBatchRequest(BaseModel):
    """POST /accounts/settlement — one request per operator per round."""
    model_config = ConfigDict(extra="allow")

    round_id: int
    game_id: int
    settlements: List[PlayerSettlement] = Field(default_factory=list)


class PlayerRollback(BaseModel):
    model_config = ConfigDict(extra="allow")

    request_id: str
    rollback_transaction_id: str
    transaction_id: str
    player_id: str
    # Reverses the previous settlement
    rollback_pl: DecimalString
    # The new result being applied in its place
    pl: DecimalString
    round_id: int
    game_id: int
    bets: List[SettledBet] = Field(default_factory=list)
    agent_id: Optional[int] = None


class RollbackBatchRequest(BaseModel):
    """POST /accounts/rollback — rollback + resettlement, batched per round."""
    model_config = ConfigDict(extra="allow")

    round_id: int
    game_id: int
    rollbacks: List[PlayerRollback] = Field(default_factory=list)


# ---- Seamless wallet ---------------------------------------------------


class SeamlessDebitRequest(BaseModel):
    """POST /accounts/transactions/debit — bets placed, take the stake now."""
    model_config = ConfigDict(extra="allow")

    request_id: str
    transaction_id: str
    player_id: str
    amount: DecimalString
    transaction_type: str = "DEBIT"
    round_id: int
    game_id: int
    version: Optional[int] = None
    agent_id: Optional[int] = None
    game_name: Optional[str] = None
    game_type: Optional[str] = None
    new_bets: List[OperatorBet] = Field(default_factory=list)
    accepted_bets: List[OperatorBet] = Field(default_factory=list)


class SeamlessCreditRequest(BaseModel):
    """POST /accounts/transactions/credit — settlement payout (may be 0.00)."""
    model_config = ConfigDict(extra="allow")

    request_id: str
    transaction_id: str
    player_id: str
    amount: DecimalString
    transaction_type: str = "CREDIT"
    round_id: int
    game_id: int
    sw_bet_transaction_id: Optional[str] = None
    agent_id: Optional[int] = None
    game_name: Optional[str] = None
    game_type: Optional[str] = None
    bets: List[SettledBet] = Field(default_factory=list)


class SeamlessRollbackRequest(BaseModel):
    """POST /accounts/transactions/rollback — undo an accepted DEBIT."""
    model_config = ConfigDict(extra="allow")

    request_id: str
    transaction_id: str
    sw_bet_transaction_id: str
    player_id: str
    amount: DecimalString
    transaction_type: str = "CREDIT"
    round_id: int
    game_id: int
    version: Optional[int] = None
    agent_id: Optional[int] = None
    game_name: Optional[str] = None
    game_type: Optional[str] = None


# ---- Inbound (Operator -> Platform) ------------------------------------


class CasinoGame(BaseModel):
    """One row of GET /games on the platform."""
    model_config = ConfigDict(extra="allow")

    id: int
    slug: Optional[str] = None
    name: str
    lang: Optional[str] = None
    thumbnail_url: Optional[str] = None
    special_note: Optional[str] = None
    currency: Optional[str] = None


class CasinoIntegrationStatus(BaseModel):
    """What the panel shows about the live casino link."""
    provider: str  # mock | live
    wallet_model: str  # exposure | seamless
    platform_configured: bool
    api_key_configured: bool
    wallet_base_path: str
    games_cached: int
    token_valid_until: Optional[str] = None
    last_error: Optional[str] = None
