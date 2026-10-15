from typing import Optional
from pydantic import BaseModel, ConfigDict

class LoginRequest(BaseModel):
    username: str
    password: str

class Verify2FARequest(BaseModel):
    temp_token: str
    otp_code: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    balance: float
    upline_share: float
    upline: Optional[str] = None
    is_2fa_enabled: bool

    model_config = ConfigDict(from_attributes=True)

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LoginResponse(BaseModel):
    requires_2fa: bool
    temp_token: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserResponse] = None
    message: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserResponse] = None
    message: str = "Authentication successful"
