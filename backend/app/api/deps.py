from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.exchange import ExchangeAccount
from app.models.user import User

# Client (player) accounts live in the users table too, but must never
# get into the admin panel.
CLIENT_ROLE = "client"


def is_staff(user: Optional[User]) -> bool:
    return bool(user) and user.role != CLIENT_ROLE


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not is_staff(user) or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    return user


# Mastan master-panel sessions use their own token type, so a panel login
# can't reach the Rolex admin API and a Rolex login can't reach the panel.
EXCHANGE_TOKEN_TYPE = "exchange"


def get_exchange_account(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> ExchangeAccount:
    payload = None
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization.split(" ", 1)[1])
    if not payload or payload.get("type") != EXCHANGE_TOKEN_TYPE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    account = db.query(ExchangeAccount).filter(ExchangeAccount.username == payload.get("sub")).first()
    if not account or not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    return account


# Player-site sessions: clients only, and their token can't reach the panel or Rolex.
PLAYER_TOKEN_TYPE = "player"


def get_player(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    payload = None
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization.split(" ", 1)[1])
    if not payload or payload.get("type") != PLAYER_TOKEN_TYPE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    user = db.query(User).filter(User.username == payload.get("sub"), User.role == CLIENT_ROLE).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    return user


def get_player_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        payload = decode_token(authorization.split(" ", 1)[1])
        if not payload or payload.get("type") != PLAYER_TOKEN_TYPE:
            return None
        return db.query(User).filter(User.username == payload.get("sub"), User.role == CLIENT_ROLE, User.is_active == True).first()
    except Exception:
        return None

