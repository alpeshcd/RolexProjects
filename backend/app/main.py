import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router

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
