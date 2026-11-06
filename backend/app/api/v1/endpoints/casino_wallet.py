"""Operator wallet API — the endpoints the casino platform calls on us.

These are mounted outside /api/v1, at `settings.CASINO_WALLET_BASE_PATH`, so
the operator base URL we hand the platform is

    https://<our-host><CASINO_WALLET_BASE_PATH>

and the paths below it are exactly the ones in the client's spec:

    GET  /accounts/balance/{player_id}        both wallet models
    POST /accounts/exposure                   exposure wallet
    POST /accounts/settlement                 exposure wallet (batched)
    POST /accounts/rollback                   exposure wallet (batched)
    POST /accounts/transactions/debit         seamless wallet
    POST /accounts/transactions/credit        seamless wallet
    POST /accounts/transactions/rollback      seamless wallet

House rules the platform relies on, all enforced here:

* Every call carries `Api-Key`. A wrong or missing one is INVALID_API_KEY.
* Anything we decline comes back as HTTP 400 with {code, message} and, where
  we know them, the player's balance and version.
* Only an unexpected failure returns 500, because 500 and the UNKNOWN_ERROR
  code are the two things the platform retries.
* Nothing here trusts the body to be well formed; a malformed request is a
  400 REQUEST_DECLINED, never a 422 (see `validation_error_response`).
"""
import logging
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, Header, Path, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.schemas.casino import (
    ExposureUpdateRequest,
    RollbackBatchRequest,
    SeamlessCreditRequest,
    SeamlessDebitRequest,
    SeamlessRollbackRequest,
    SettlementBatchRequest,
)
from app.services.casino import wallet
from app.services.casino.wallet import (
    INVALID_API_KEY,
    REQUEST_DECLINED,
    UNKNOWN_ERROR,
    WalletError,
    fmt,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ---- responses ---------------------------------------------------------

def balance_response(balance: float, version: int) -> JSONResponse:
    return JSONResponse(status_code=200, content={"balance": fmt(balance), "version": version})


def error_response(err: WalletError, status_code: int = 400) -> JSONResponse:
    body: dict = {"code": err.code, "message": err.message}
    if err.balance is not None:
        body["balance"] = fmt(err.balance)
    if err.version is not None:
        body["version"] = err.version
    return JSONResponse(status_code=status_code, content=body)


def validation_error_response(detail) -> JSONResponse:
    """A malformed wallet body. The platform only understands its own error
    envelope, so a FastAPI 422 would read as an outage to it."""
    return JSONResponse(
        status_code=400,
        content={
            "code": REQUEST_DECLINED,
            "message": "The request has been declined due to missing or incorrect information.",
            "errors": detail,
        },
    )


# ---- guards ------------------------------------------------------------

def client_ip(request: Request) -> str:
    """The caller's address, honouring one proxy hop in front of us."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


def verify_api_key(
    request: Request,
    api_key: Optional[str] = Header(None, alias="Api-Key"),
) -> str:
    """The `Api-Key` header, plus the optional IP allowlist.

    Fails closed: with no CASINO_OPERATOR_API_KEY configured these endpoints
    decline everything, so a half-configured deployment can never move money.
    """
    expected = settings.CASINO_OPERATOR_API_KEY or ""
    if not expected:
        logger.error("Casino wallet call refused: CASINO_OPERATOR_API_KEY is not set")
        raise WalletError(INVALID_API_KEY, "Operator wallet API is not configured")
    if not api_key or not secrets.compare_digest(api_key, expected):
        logger.warning("Casino wallet call refused: bad Api-Key from %s", client_ip(request))
        raise WalletError(INVALID_API_KEY, "Invalid API key")

    allowed = [ip.strip() for ip in (settings.CASINO_ALLOWED_IPS or "").split(",") if ip.strip()]
    if allowed:
        ip = client_ip(request)
        if ip not in allowed:
            logger.warning("Casino wallet call refused: %s is not allowlisted", ip)
            raise WalletError(INVALID_API_KEY, "Caller address is not allowlisted")
    return api_key


# Every route goes through the key check, and a failure there comes back in the
# platform's own envelope rather than FastAPI's.
def guard(
    request: Request,
    api_key: Optional[str] = Header(None, alias="Api-Key"),
) -> Optional[WalletError]:
    try:
        verify_api_key(request, api_key)
        return None
    except WalletError as err:
        return err


# ---- common ------------------------------------------------------------

@router.get("/accounts/balance/{player_id}", tags=["Casino Wallet"])
def get_player_balance(
    player_id: str = Path(..., description="Operator-side player id"),
    player_session_id: Optional[str] = Header(None, alias="Player-Session-ID"),
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Current balance and version. Answers even with no or an expired session
    token, because a round can settle outside the life of a player session."""
    if denied:
        return error_response(denied)
    try:
        balance, version = wallet.get_balance(db, player_id, player_session_id)
        return balance_response(balance, version)
    except WalletError as err:
        return error_response(err)
    except Exception:
        logger.exception("Casino balance lookup failed for %s", player_id)
        return error_response(WalletError(UNKNOWN_ERROR, "Could not read the player balance"))


# ---- exposure wallet ---------------------------------------------------

@router.post("/accounts/exposure", tags=["Casino Wallet"])
def update_exposure(
    req: ExposureUpdateRequest,
    player_session_id: Optional[str] = Header(None, alias="Player-Session-ID"),
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Hold the player's worst case for a round. All of `new_bets` is accepted
    or none of it is."""
    if denied:
        return error_response(denied)
    try:
        balance, version = wallet.update_exposure(db, req, player_session_id)
        return balance_response(balance, version)
    except WalletError as err:
        return error_response(err)
    except Exception:
        db.rollback()
        logger.exception("Casino exposure update failed for %s round %s", req.player_id, req.round_id)
        return error_response(WalletError(UNKNOWN_ERROR, "Could not update the exposure"))


@router.post("/accounts/settlement", tags=["Casino Wallet"])
def settlement(
    req: SettlementBatchRequest,
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Settle a round: release each player's hold and apply their `pl`.

    One request covers many players. Each is committed on its own and deduped
    on `transaction_id`, so a retry after a partial failure re-applies nothing.
    """
    if denied:
        return error_response(denied)
    return _run_batch(
        db,
        req.settlements,
        lambda item: wallet.settle_player(db, item, req.round_id, req.game_id),
        what=f"settlement of round {req.round_id}",
    )


@router.post("/accounts/rollback", tags=["Casino Wallet"])
def rollback(
    req: RollbackBatchRequest,
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Roll a settled round back and apply the new result.

    Two legs per player, each with its own idempotency key, so one of them
    having landed already does not block the other.
    """
    if denied:
        return error_response(denied)
    return _run_batch(
        db,
        req.rollbacks,
        lambda item: wallet.rollback_player(db, item, req.round_id, req.game_id),
        what=f"rollback of round {req.round_id}",
    )


def _run_batch(db: Session, items, apply, *, what: str) -> JSONResponse:
    """Apply one batched wallet request, player by player.

    Returns 200 with every player's balance when all of them went through.
    Otherwise the platform's retry rule decides the shape: a transient failure
    answers with code UNKNOWN_ERROR so it comes back, a permanent one (an
    unknown player, say) answers with its own code so it does not.
    """
    results: list[dict] = []
    failures: list[WalletError] = []

    for item in items or []:
        try:
            username, balance, version = apply(item)
            db.commit()
            results.append(
                {"player_id": item.player_id, "balance": fmt(balance), "version": version}
            )
        except WalletError as err:
            db.rollback()
            logger.warning("Casino %s declined for %s: %s %s", what, item.player_id, err.code, err.message)
            failures.append(err)
        except Exception:
            db.rollback()
            logger.exception("Casino %s failed for %s", what, item.player_id)
            failures.append(WalletError(UNKNOWN_ERROR, f"Could not process the {what}"))

    if not failures:
        return JSONResponse(status_code=200, content={"results": results})

    # UNKNOWN_ERROR is the code that tells the platform to try again.
    retryable = next((f for f in failures if f.code == UNKNOWN_ERROR), None)
    chosen = retryable or failures[0]
    return JSONResponse(
        status_code=400,
        content={"code": chosen.code, "message": chosen.message, "results": results},
    )


# ---- seamless wallet ---------------------------------------------------

@router.post("/accounts/transactions/debit", tags=["Casino Wallet"])
def seamless_debit(
    req: SeamlessDebitRequest,
    player_session_id: Optional[str] = Header(None, alias="Player-Session-ID"),
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Take the stake for bets just placed. Replays return the current balance."""
    if denied:
        return error_response(denied)
    try:
        balance, version = wallet.seamless_debit(db, req, player_session_id)
        return balance_response(balance, version)
    except WalletError as err:
        return error_response(err)
    except Exception:
        db.rollback()
        logger.exception("Casino debit failed for %s tx %s", req.player_id, req.transaction_id)
        return error_response(WalletError(UNKNOWN_ERROR, "Could not process the debit"))


@router.post("/accounts/transactions/credit", tags=["Casino Wallet"])
def seamless_credit(
    req: SeamlessCreditRequest,
    player_session_id: Optional[str] = Header(None, alias="Player-Session-ID"),
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Pay a settlement. `amount` may be 0.00 to confirm a round the player lost."""
    if denied:
        return error_response(denied)
    try:
        balance, version = wallet.seamless_credit(db, req, player_session_id)
        return balance_response(balance, version)
    except WalletError as err:
        return error_response(err)
    except Exception:
        db.rollback()
        logger.exception("Casino credit failed for %s tx %s", req.player_id, req.transaction_id)
        return error_response(WalletError(UNKNOWN_ERROR, "Could not process the credit"))


@router.post("/accounts/transactions/rollback", tags=["Casino Wallet"])
def seamless_rollback(
    req: SeamlessRollbackRequest,
    player_session_id: Optional[str] = Header(None, alias="Player-Session-ID"),
    denied: Optional[WalletError] = Depends(guard),
    db: Session = Depends(get_db),
):
    """Give back a debited stake. Processed even with no or an expired session."""
    if denied:
        return error_response(denied)
    try:
        balance, version = wallet.seamless_rollback(db, req, player_session_id)
        return balance_response(balance, version)
    except WalletError as err:
        return error_response(err)
    except Exception:
        db.rollback()
        logger.exception("Casino rollback failed for %s tx %s", req.player_id, req.transaction_id)
        return error_response(WalletError(UNKNOWN_ERROR, "Could not process the rollback"))
