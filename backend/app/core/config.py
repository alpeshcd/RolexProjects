import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rolex Admin Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rolex-super-secret-jwt-key-2026-exchange-panel")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days
    
    # Shared OTP accepted for every 2FA account, for local testing only.
    # Set DEMO_OTP_CODE="" in production so only real authenticator codes work.
    DEMO_OTP_CODE: str = os.getenv("DEMO_OTP_CODE", "123456")

    # Market data source for the Mastan master panel.
    # "mock"   – generated fixtures/odds (default, works offline)
    # "mastan" – real Mastan exchange API (requires EXCHANGE_API_KEY + EXCHANGE_API_URL)
    EXCHANGE_PROVIDER: str = os.getenv("EXCHANGE_PROVIDER", "mock")

    # Real Mastan exchange API credentials (only needed when EXCHANGE_PROVIDER=mastan)
    EXCHANGE_API_URL: str = os.getenv("EXCHANGE_API_URL", "")
    EXCHANGE_API_KEY: str = os.getenv("EXCHANGE_API_KEY", "")

    # Betfair API credentials (only needed when EXCHANGE_PROVIDER=betfair)
    BETFAIR_USERNAME: str = os.getenv("BETFAIR_USERNAME", "")
    BETFAIR_PASSWORD: str = os.getenv("BETFAIR_PASSWORD", "")
    BETFAIR_APP_KEY: str = os.getenv("BETFAIR_APP_KEY", "")
    BETFAIR_PROXY: str = os.getenv("BETFAIR_PROXY", "")

    # Password given to the auto-created top account of each domain portal, for
    # local testing only. Change it from the panel (or set this) before going live.
    EXCHANGE_DEMO_PASSWORD: str = os.getenv("EXCHANGE_DEMO_PASSWORD", "master123")

    # Player site betting. In-play bets wait this long and are re-checked
    # against the live price before they are accepted.
    PLAYER_BET_DELAY_SECONDS: int = int(os.getenv("PLAYER_BET_DELAY_SECONDS", "3"))
    # Accept bets on mock (demo) odds, e.g. while Betfair is unreachable, so the
    # client can test the flow. Set PLAYER_ALLOW_DEMO_ODDS=false before going live.
    PLAYER_ALLOW_DEMO_ODDS: bool = os.getenv("PLAYER_ALLOW_DEMO_ODDS", "true").lower() == "true"

    # ---- Live Casino (Operator API & Seamless/Exposure wallet) -------------
    # Which casino catalog the player site is served:
    #   "mock" – the built-in demo table list (default, works offline)
    #   "live" – the client's Live Casino Platform (needs CASINO_API_* below)
    CASINO_PROVIDER: str = os.getenv("CASINO_PROVIDER", "mock")

    # Inbound (Operator -> Platform). Base URL the platform shared with us,
    # e.g. https://api.example.com/api/operator/e_w/v1
    CASINO_API_URL: str = os.getenv("CASINO_API_URL", "")
    CASINO_API_USERNAME: str = os.getenv("CASINO_API_USERNAME", "")
    CASINO_API_PASSWORD: str = os.getenv("CASINO_API_PASSWORD", "")
    CASINO_API_TIMEOUT: int = int(os.getenv("CASINO_API_TIMEOUT", "15"))

    # Wallet model agreed with the platform: "exposure" or "seamless".
    # Exposure matches how our own sports book works (the worst case is held
    # back, the balance moves once on settlement), so it is the default.
    CASINO_WALLET_MODEL: str = os.getenv("CASINO_WALLET_MODEL", "exposure")

    # Outbound (Platform -> Operator). The platform must send this value in the
    # `Api-Key` header of every wallet call. Generate a long random string and
    # hand it to the platform together with CASINO_WALLET_BASE_PATH.
    CASINO_OPERATOR_API_KEY: str = os.getenv("CASINO_OPERATOR_API_KEY", "")

    # Where our wallet endpoints are mounted. The operator base URL we give the
    # platform is  https://<our-host><CASINO_WALLET_BASE_PATH>  and it then calls
    # e.g. POST <base>/accounts/exposure exactly as the spec describes.
    CASINO_WALLET_BASE_PATH: str = os.getenv("CASINO_WALLET_BASE_PATH", "/casino/operator")

    # Our production IPs must be whitelisted by the platform; theirs are
    # whitelisted here. Comma-separated; empty disables the check.
    CASINO_ALLOWED_IPS: str = os.getenv("CASINO_ALLOWED_IPS", "")

    # Launch URL defaults sent with POST /launch-url
    CASINO_RETURN_URL: str = os.getenv("CASINO_RETURN_URL", "")
    CASINO_CURRENCY: str = os.getenv("CASINO_CURRENCY", "INR")
    CASINO_COUNTRY: str = os.getenv("CASINO_COUNTRY", "IN")
    CASINO_LANG: str = os.getenv("CASINO_LANG", "en-US")
    # How long a player session token we issue stays valid (hours)
    CASINO_SESSION_HOURS: int = int(os.getenv("CASINO_SESSION_HOURS", "12"))
    # Games list is refreshed at most this often (the platform asks for
    # once or twice a day)
    CASINO_GAMES_CACHE_HOURS: int = int(os.getenv("CASINO_GAMES_CACHE_HOURS", "6"))

    # How live tables are labelled on the player site, and the per-session bet
    # limit we send with each launch (the platform's games list carries no
    # limits, so these are ours).
    CASINO_PROVIDER_NAME: str = os.getenv("CASINO_PROVIDER_NAME", "Live Casino")
    CASINO_MIN_BET: float = float(os.getenv("CASINO_MIN_BET", "100"))
    CASINO_MAX_BET: float = float(os.getenv("CASINO_MAX_BET", "200000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rolex.db")

    # Uploaded files (e.g. account QR images), served at /api/uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(Path(__file__).resolve().parents[2] / "uploads"))
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
