from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, verify_totp_code
from app.api.deps import get_current_user
from app.models.statement import AccountStatement
from app.models.user import User
from app.schemas.statement import StatementResponse, SiteStatRow, ChangePasswordRequest

router = APIRouter()

SEED_STATEMENTS = [
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 12, 40, 27),
        "event_type": "Tennis",
        "amount": 4000.00,
        "total": 4000.00,
        "balance": 762427.20,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Svitolina V H Guo > Match Odds [Elina Svitolina]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 11, 52, 32),
        "event_type": "Tennis",
        "amount": 1000.00,
        "total": 1000.00,
        "balance": 758427.20,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Muchova V Di Shnaider > Match Odds [Diana Shnaider]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 9, 26, 10),
        "event_type": "-",
        "amount": 2000.00,
        "total": 2000.00,
        "balance": 1728434.00,
        "type": "Withdraw",
        "dc": "Credit",
        "description": "Chips Withdrawn From 247Virat867 [WEBSITE]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 9, 26, 10),
        "event_type": "-",
        "amount": 2000.00,
        "total": 2000.00,
        "balance": 0.00,
        "type": "Withdraw",
        "dc": "Credit",
        "description": "B-Withdraw From 247Virat867 [Transaction No : 17486907, ][WEBSITE]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 1, 38, 9),
        "event_type": "-",
        "amount": 0.00,
        "total": 0.00,
        "balance": 757427.20,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Casino MAC444 - 1792008421:1792008481",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 1, 37, 2),
        "event_type": "-",
        "amount": 0.00,
        "total": 0.00,
        "balance": 757427.20,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Casino MAC444 - 1792008361:1792008421",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 1, 14, 12),
        "event_type": "Cricket",
        "amount": -2617.00,
        "total": -2590.83,
        "balance": 757427.20,
        "type": "Profit & Loss",
        "dc": "Debit",
        "description": "Western Province V Boland > Match Odds [Western Province]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 1, 4, 19),
        "event_type": "Cricket",
        "amount": 953.00,
        "total": 953.47,
        "balance": 760018.03,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Knights V Eastern Storm > Match Odds [Eastern Storm]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 0, 44, 9),
        "event_type": "Cricket",
        "amount": 300.00,
        "total": 300.00,
        "balance": 759064.56,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Bangladesh Legends V South Africa Legends > Match Odds [South Africa Legends]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 15, 0, 43, 8),
        "event_type": "Cricket",
        "amount": 422.28,
        "total": 422.28,
        "balance": 758764.56,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Bangladesh Legends V South Africa Legends > BOOKMAKER [South Africa Legends]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 54, 3),
        "event_type": "-",
        "amount": 0.00,
        "total": 0.00,
        "balance": 758342.00,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Casino MAC444 - 1792002181:1792002241",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 52, 3),
        "event_type": "-",
        "amount": 0.00,
        "total": 0.00,
        "balance": 758342.00,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Casino MAC444 - 1792002061:1792002121",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 49, 3),
        "event_type": "-",
        "amount": 0.00,
        "total": 0.00,
        "balance": 758342.00,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Casino MAC444 - 1792001881:1792001941",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 26, 36),
        "event_type": "Cricket",
        "amount": -520.00,
        "total": -520.00,
        "balance": 758342.28,
        "type": "Profit & Loss",
        "dc": "Debit",
        "description": "Bangladesh Legends V South Africa Legends > FANCY > 6 Over Runs BAN L (NI)[27]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 23, 41),
        "event_type": "Cricket",
        "amount": 0.00,
        "total": 0.00,
        "balance": 758862.28,
        "type": "Profit & Loss",
        "dc": "Credit",
        "description": "Western Province V Boland > FANCY > 20 Over Runs BOL[174]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 18, 55),
        "event_type": "Cricket",
        "amount": -2569.59,
        "total": -2533.90,
        "balance": 758862.28,
        "type": "Profit & Loss",
        "dc": "Debit",
        "description": "India V West Indies > Match Odds [West Indies]",
    },
    {
        "site_user": "Mastan777 (mastan247.club)",
        "domain": "mastan247.club",
        "username": "Mastan777",
        "date": datetime(2026, 10, 14, 23, 16, 1),
        "event_type": "Cricket",
        "amount": -2746.48,
        "total": -2746.48,
        "balance": 761396.18,
        "type": "Profit & Loss",
        "dc": "Debit",
        "description": "India V West Indies > BOOKMAKER [West Indies]",
    },
]

SITE_STATS_ROWS = [
    {
        "id": 1,
        "master_id": 3894,
        "username": "Mastan777",
        "total_clients": 2,
        "total_approved_deposit": 15300.0,
        "number_approved_deposit": 8,
        "total_rejected_deposit": 0.0,
        "number_rejected_deposit": 0,
        "total_approved_withdraw": 27000.0,
        "number_approved_withdraw": 5,
        "total_rejected_withdraw": 0.0,
        "number_rejected_withdraw": 0,
    },
    {
        "id": 2,
        "master_id": 3895,
        "username": "Mastan365m",
        "total_clients": 24,
        "total_approved_deposit": 112070.0,
        "number_approved_deposit": 69,
        "total_rejected_deposit": 17300.0,
        "number_rejected_deposit": 10,
        "total_approved_withdraw": 43067.0,
        "number_approved_withdraw": 15,
        "total_rejected_withdraw": 21840.0,
        "number_rejected_withdraw": 3,
    },
    {
        "id": 3,
        "master_id": 3896,
        "username": "Mastan99m",
        "total_clients": 22,
        "total_approved_deposit": 306632.0,
        "number_approved_deposit": 187,
        "total_rejected_deposit": 25000.0,
        "number_rejected_deposit": 47,
        "total_approved_withdraw": 495722.0,
        "number_approved_withdraw": 92,
        "total_rejected_withdraw": 258898.0,
        "number_rejected_withdraw": 32,
    },
    {
        "id": 4,
        "master_id": 3897,
        "username": "Mastanreddymas",
        "total_clients": 2,
        "total_approved_deposit": 61919.0,
        "number_approved_deposit": 41,
        "total_rejected_deposit": 14000.0,
        "number_rejected_deposit": 14,
        "total_approved_withdraw": 15320.0,
        "number_approved_withdraw": 7,
        "total_rejected_withdraw": 9100.0,
        "number_rejected_withdraw": 9,
    },
]

def seed_statements_if_needed(db: Session):
    count = db.query(AccountStatement).count()
    if count == 0:
        for s in SEED_STATEMENTS:
            rec = AccountStatement(
                site_user=s["site_user"],
                domain=s["domain"],
                username=s["username"],
                date=s["date"],
                event_type=s["event_type"],
                amount=s["amount"],
                total=s["total"],
                balance=s["balance"],
                type=s["type"],
                dc=s["dc"],
                description=s["description"],
                created_at=s["date"],
            )
            db.add(rec)
        db.commit()

@router.get("", response_model=List[StatementResponse])
@router.get("/", response_model=List[StatementResponse])
def get_account_statements(
    site_user: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    seed_statements_if_needed(db)
    query = db.query(AccountStatement)

    if site_user and site_user.strip() and site_user.lower() not in ["all", "select user"]:
        query = query.filter(AccountStatement.site_user.ilike(f"%{site_user.strip()}%"))

    if type and type.strip() and type.lower() not in ["all", "select type"]:
        query = query.filter(AccountStatement.type.ilike(type.strip()))

    rows = query.order_by(AccountStatement.id.asc()).all()

    results = []
    for r in rows:
        results.append(
            StatementResponse(
                id=r.id,
                site_user=r.site_user,
                domain=r.domain,
                username=r.username,
                date=r.date,
                date_str=r.date.strftime("%d/%m/%Y %I:%M:%S %p") if r.date else "",
                event_type=r.event_type,
                amount=r.amount,
                total=r.total,
                balance=r.balance,
                type=r.type,
                dc=r.dc,
                description=r.description,
            )
        )
    return results

@router.get("/site-stats", response_model=List[SiteStatRow])
def get_site_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    return SITE_STATS_ROWS

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match."
        )

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    if req.new_password == req.old_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password."
        )

    if current_user.is_2fa_enabled and not verify_totp_code(
        current_user.totp_secret, (req.otp_code or "").strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter the current 2FA code from your Authenticator app to change the password."
        )

    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    return {"message": "Password changed successfully! Next login will require your new password."}
