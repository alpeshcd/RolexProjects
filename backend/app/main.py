import os
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
from app.api.v1.endpoints import casino_wallet

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Operator wallet API — the casino platform calls these, not our frontends, so
# they sit outside /api/v1 under the base URL we hand the platform:
#   https://<our-host><CASINO_WALLET_BASE_PATH>/accounts/...
CASINO_WALLET_PREFIX = (settings.CASINO_WALLET_BASE_PATH or "").rstrip("/")
app.include_router(casino_wallet.router, prefix=CASINO_WALLET_PREFIX)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """FastAPI's 422 is fine for our own frontends, but the casino platform
    only understands its own error envelope, so a malformed wallet body comes
    back as a 400 it can read."""
    if CASINO_WALLET_PREFIX and request.url.path.startswith(CASINO_WALLET_PREFIX + "/"):
        return casino_wallet.validation_error_response(
            [{"loc": list(e.get("loc", [])), "msg": e.get("msg", "")} for e in exc.errors()]
        )
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(exc.errors())})

# Uploaded files (account QR images). Under /api so the frontend dev proxy forwards it.
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/api/notification/count")
def notification_count():
    return {"count": 0}

@app.get("/api/notification/list")
def notification_list():
    return []

@app.get("/api/search/query")
def search_query(query: str = ""):
    q = query.strip().lower()
    items = [
        {"title": "Clients", "url": "/clients", "categoryTitle": "Navigation"},
        {"title": "Accounts", "url": "/accounts", "categoryTitle": "Navigation"},
        {"title": "Deposit Banking", "url": "/deposit", "categoryTitle": "Banking"},
        {"title": "Withdraw Payouts", "url": "/withdraw", "categoryTitle": "Banking"},
        {"title": "Extra Users", "url": "/extra-users", "categoryTitle": "Security"},
        {"title": "A/C Statement", "url": "/statement", "categoryTitle": "Ledger"},
        {"title": "Site User Stats", "url": "/site-user-stats", "categoryTitle": "Analytics"},
        {"title": "Change Password", "url": "/change-password", "categoryTitle": "Settings"},
    ]
    filtered = [i for i in items if q in i["title"].lower()] if q else items
    categories = list({i["categoryTitle"] for i in filtered})
    return [{"title": cat, "data": [i for i in filtered if i["categoryTitle"] == cat]} for cat in categories]
