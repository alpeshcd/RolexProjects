from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    create_2fa_temp_token,
    decode_token,
    verify_totp_code,
    generate_totp_secret
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    Verify2FARequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse
)

router = APIRouter()

def init_default_users(db: Session):
    # 1. Super Master (Rolex Panel, with 2FA)
    user_mastan = db.query(User).filter(User.username == "MASTAN99M").first()
    if not user_mastan:
        user_mastan = User(
            username="MASTAN99M",
            full_name="Mastan Admin",
            email="admin@rolexpanel.win",
            hashed_password=get_password_hash("admin123"),
            role="supermaster",
            balance=143418.0,
            upline_share=25589.0,
            upline="MASTAN365",
            is_2fa_enabled=True,
            totp_secret=generate_totp_secret()
        )
        db.add(user_mastan)

    # 2. Direct Administrator (Ecme Admin, No 2FA)
    user_admin = db.query(User).filter(User.username == "admin").first()
    if not user_admin:
        user_admin = User(
            username="admin",
            full_name="System Administrator",
            email="admin@ecme.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            balance=500000.0,
            upline_share=50000.0,
            upline="DIRECT",
            is_2fa_enabled=False,
            totp_secret=None
        )
        db.add(user_admin)

    # 3. Demo Operator (No 2FA)
    user_demo = db.query(User).filter(User.username == "demo").first()
    if not user_demo:
        user_demo = User(
            username="demo",
            full_name="Demo Operator",
            email="demo@rolexpanel.win",
            hashed_password=get_password_hash("password123"),
            role="operator",
            balance=25000.0,
            upline_share=1000.0,
            upline="MASTAN99M",
            is_2fa_enabled=False,
            totp_secret=None
        )
        db.add(user_demo)

    db.commit()

@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    init_default_users(db)
    
    # Case-insensitive username lookup
    user = db.query(User).filter(User.username.ilike(login_data.username.strip())).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    # If 2FA is enabled, issue a temporary token to proceed to 2FA step
    if user.is_2fa_enabled:
        temp_token = create_2fa_temp_token(user.username)
        return LoginResponse(
            requires_2fa=True,
            temp_token=temp_token,
            message="Please verify your 2FA OTP to complete login."
        )

    # 2FA not enabled - issue direct access token + refresh token
    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return LoginResponse(
        requires_2fa=False,
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
        message="Login successful"
    )

@router.post("/verify-2fa", response_model=TokenResponse)
def verify_2fa(req: Verify2FARequest, db: Session = Depends(get_db)):
    payload = decode_token(req.temp_token)
    if not payload or payload.get("type") != "2fa_temp":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired 2FA session. Please login again."
        )

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify OTP code with user's secret (or test code 123456)
    is_valid = verify_totp_code(user.totp_secret or "DEMOSECRET", req.otp_code.strip())
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please enter the current code from your Authenticator app (e.g. 123456)."
        )

    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
        message="2FA verification successful. Logged in!"
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please login again."
        )

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    new_access_token = create_access_token(user.username)
    new_refresh_token = create_refresh_token(user.username)
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.model_validate(user),
        message="Token refreshed successfully"
    )

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}
