import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.config import settings
from app.core.database import get_db
from app.models.account import BankAccount
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter()

SEED_ACCOUNTS = [
    {
        "user": "MASTAN99M",
        "name": "DEEPAK NARAYAN",
        "type": "UPI",
        "category": "No Category",
        "account_number": "BHARATPE2S0L0D8U5M43874@UNITYPE",
        "min_amount": 100.0,
        "max_amount": 15000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 11, 0, 23, 23)
    },
    {
        "user": "MASTAN99M",
        "name": "ANSARI MOHMMADSAHID",
        "type": "UPI",
        "category": "No Category",
        "account_number": "BHARATPE2N0T0W8J0Y32706@Unitype",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Active",
        "is_active": True,
        "last_update": datetime(2026, 10, 11, 18, 15, 32)
    },
    {
        "user": "MASTAN99M",
        "name": "ANSARI MOHMMADSAHID",
        "type": "UPI",
        "category": "No Category",
        "account_number": "Gpay-12208474318@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 10000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 5, 8, 41, 56)
    },
    {
        "user": "MASTAN99M",
        "name": "VHORA FAIJANBHAI",
        "type": "UPI",
        "category": "No Category",
        "account_number": "BHARATPE09H9P1R8G2050828@YESBANKLTD",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 3, 19, 26, 15)
    },
    {
        "user": "MASTAN99M",
        "name": "Aman Tasambad",
        "type": "UPI",
        "category": "No Category",
        "account_number": "Bharatpe2n0w0y8t1k20925@Unitype",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 1, 11, 17, 0)
    },
    {
        "user": "MASTAN99M",
        "name": "Sumra Nasir",
        "type": "UPI",
        "category": "No Category",
        "account_number": "6359874017@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 30, 23, 56, 21)
    },
    {
        "user": "MASTAN99M",
        "name": "MR SAIFIL VAHORA",
        "type": "UPI",
        "category": "No Category",
        "account_number": "BHARATPE2P0B8O0I56062@Unitype",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 1, 17, 46, 42)
    },
    {
        "user": "MASTAN99M",
        "name": "RAHULKUMAR",
        "type": "UPI",
        "category": "No Category",
        "account_number": "BHARATPE2POJOPT7M8G74050@UNITYPE",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 29, 21, 57, 4)
    },
    {
        "user": "MASTAN99M",
        "name": "Kartik Bhoriyani",
        "type": "UPI",
        "category": "No Category",
        "account_number": "Bharatpe.9a0rz1b2e739573@Unitpe",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 28, 23, 20, 30)
    },
    {
        "user": "MASTAN99M",
        "name": "Kartik Bhoriyani Store",
        "type": "UPI",
        "category": "No Category",
        "account_number": "9574008658@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 15000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 1, 10, 49, 26)
    },
    {
        "user": "MASTAN99M",
        "name": "ANASH KIRANA",
        "type": "UPI",
        "category": "No Category",
        "account_number": "Paytm.53akvws@Pty",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 10, 1, 12, 1, 27)
    },
    {
        "user": "MASTAN99M",
        "name": "Vaishali Jayantilal",
        "type": "UPI",
        "category": "No Category",
        "account_number": "Q386283307@Ybl",
        "min_amount": 100.0,
        "max_amount": 15000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 26, 21, 6, 49)
    },
    {
        "user": "MASTAN99M",
        "name": "Star General Store",
        "type": "UPI",
        "category": "No Category",
        "account_number": "9004764807@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 30, 10, 42, 20)
    },
    {
        "user": "MASTAN99M",
        "name": "Vivek Mavdaiya",
        "type": "UPI",
        "category": "No Category",
        "account_number": "9427790745@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 28, 23, 34, 38)
    },
    {
        "user": "MASTAN99M",
        "name": "Ashokbhai Kantilal",
        "type": "UPI",
        "category": "No Category",
        "account_number": "7669126735@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 10000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 22, 8, 38, 34)
    },
    {
        "user": "MASTAN99M",
        "name": "CHAUHAN MANISH DEVRAJBHAI",
        "type": "UPI",
        "category": "No Category",
        "account_number": "6353802356-1@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 20, 23, 38, 47)
    },
    {
        "user": "MASTAN99M",
        "name": "Vipulbhai",
        "type": "UPI",
        "category": "No Category",
        "account_number": "9265817615@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 40000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 20, 18, 51, 30)
    },
    {
        "user": "MASTAN99M",
        "name": "Sagar General Store",
        "type": "UPI",
        "category": "No Category",
        "account_number": "Pkt-7856871773@Okbizaxis",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 20, 15, 30, 40)
    },
    {
        "user": "MASTAN99M",
        "name": "BALDEV FASHION JUNCTION",
        "type": "UPI",
        "category": "No Category",
        "account_number": "9313793223@OKBIZAXIS",
        "min_amount": 100.0,
        "max_amount": 20000.0,
        "max_deposit": "Both",
        "account_for": "Deposit",
        "status": "Inactive",
        "is_active": False,
        "last_update": datetime(2026, 9, 23, 0, 21, 47)
    },
]

def seed_accounts_if_empty(db: Session):
    count = db.query(BankAccount).count()
    if count == 0:
        for acc in SEED_ACCOUNTS:
            b = BankAccount(
                user=acc["user"],
                name=acc["name"],
                type=acc["type"],
                category=acc["category"],
                account_number=acc["account_number"],
                min_amount=acc["min_amount"],
                max_amount=acc["max_amount"],
                max_deposit=acc["max_deposit"],
                account_for=acc["account_for"],
                status=acc["status"],
                is_active=acc["is_active"],
                last_update=acc["last_update"],
                created_at=acc["last_update"],
            )
            db.add(b)
        db.commit()

@router.get("", response_model=List[AccountResponse])
def get_accounts(
    user: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    account_number: Optional[str] = Query(None),
    amount_upto: Optional[float] = Query(None, description="Only accounts whose max amount is at most this value"),
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    seed_accounts_if_empty(db)
    query = db.query(BankAccount)

    if user and user.strip() and user.lower() not in ["all", "select user"]:
        query = query.filter(func.lower(BankAccount.user) == user.strip().lower())

    if name and name.strip():
        query = query.filter(BankAccount.name.icontains(name.strip(), autoescape=True))

    if account_number and account_number.strip():
        query = query.filter(BankAccount.account_number.icontains(account_number.strip(), autoescape=True))

    if amount_upto is not None:
        query = query.filter(BankAccount.max_amount <= amount_upto)

    if status and status.strip() and status.lower() not in ["all", "select status"]:
        query = query.filter(BankAccount.status.ilike(status.strip()))

    if type and type.strip() and type.lower() not in ["all", "select type"]:
        query = query.filter(BankAccount.type.ilike(type.strip()))

    accounts = query.order_by(BankAccount.id.asc()).all()

    results = []
    for a in accounts:
        last_str = a.last_update.strftime("%d-%m-%Y %I:%M:%S %p") if a.last_update else None
        res = AccountResponse(
            id=a.id,
            user=a.user,
            name=a.name,
            type=a.type,
            category=a.category,
            account_number=a.account_number,
            ifsc_code=a.ifsc_code,
            bank_name=a.bank_name,
            min_amount=a.min_amount,
            max_amount=a.max_amount,
            max_deposit=a.max_deposit,
            account_for=a.account_for,
            is_only_withdrawal=a.is_only_withdrawal,
            qr_code_url=a.qr_code_url,
            status=a.status,
            is_active=a.is_active,
            last_update=a.last_update,
            last_update_str=last_str,
            created_at=a.created_at
        )
        results.append(res)
    return results

QR_MAX_BYTES = 2 * 1024 * 1024

def _qr_image_extension(data: bytes) -> Optional[str]:
    """Detect the image type from its first bytes; SVG and anything else is refused."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None

@router.post("/qr-upload")
async def upload_qr_image(file: UploadFile = File(...)):
    """Store a QR code image and return the URL to save as the account's qr_code_url."""
    data = await file.read(QR_MAX_BYTES + 1)
    if len(data) > QR_MAX_BYTES:
        raise HTTPException(status_code=413, detail="QR image must be 2 MB or smaller.")
    ext = _qr_image_extension(data)
    if not ext:
        raise HTTPException(status_code=400, detail="QR code must be a PNG, JPG, WEBP or GIF image.")

    qr_dir = os.path.join(settings.UPLOAD_DIR, "qr")
    os.makedirs(qr_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(qr_dir, filename), "wb") as fh:
        fh.write(data)
    return {"url": f"/api/uploads/qr/{filename}"}

@router.get("/users", response_model=List[str])
def get_account_users(db: Session = Depends(get_db)):
    """Distinct account owners, for the User filter dropdown."""
    rows = (
        db.query(BankAccount.user)
        .filter(BankAccount.user.isnot(None), BankAccount.user != "")
        .distinct()
        .order_by(BankAccount.user)
        .all()
    )
    return [r[0] for r in rows]

@router.get("/active", response_model=List[AccountResponse])
def get_active_deposit_accounts(db: Session = Depends(get_db)):
    seed_accounts_if_empty(db)
    accounts = db.query(BankAccount).filter(BankAccount.status == "Active").all()
    results = []
    for a in accounts:
        last_str = a.last_update.strftime("%d-%m-%Y %I:%M:%S %p") if a.last_update else None
        results.append(
            AccountResponse(
                id=a.id,
                user=a.user,
                name=a.name,
                type=a.type,
                category=a.category,
                account_number=a.account_number,
                ifsc_code=a.ifsc_code,
                bank_name=a.bank_name,
                min_amount=a.min_amount,
                max_amount=a.max_amount,
                max_deposit=a.max_deposit,
                account_for=a.account_for,
                is_only_withdrawal=a.is_only_withdrawal,
                qr_code_url=a.qr_code_url,
                status=a.status,
                is_active=a.is_active,
                last_update=a.last_update,
                last_update_str=last_str,
                created_at=a.created_at
            )
        )
    return results

@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(acc_in: AccountCreate, db: Session = Depends(get_db)):
    is_act = acc_in.status.lower() == "active"
    new_acc = BankAccount(
        user=acc_in.user or "MASTAN99M",
        name=acc_in.name.strip().upper(),
        type=acc_in.type.strip().upper(),
        category=acc_in.category or "No Category",
        account_number=acc_in.account_number.strip(),
        ifsc_code=acc_in.ifsc_code.strip() if acc_in.ifsc_code else None,
        bank_name=acc_in.bank_name.strip() if acc_in.bank_name else None,
        min_amount=acc_in.min_amount or 100.0,
        max_amount=acc_in.max_amount or 20000.0,
        max_deposit=acc_in.max_deposit or "Both",
        account_for="Withdraw" if acc_in.is_only_withdrawal else (acc_in.account_for or "Deposit"),
        is_only_withdrawal=acc_in.is_only_withdrawal,
        qr_code_url=acc_in.qr_code_url,
        status="Active" if is_act else "Inactive",
        is_active=is_act,
        last_update=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(new_acc)
    db.commit()
    db.refresh(new_acc)

    last_str = new_acc.last_update.strftime("%d-%m-%Y %I:%M:%S %p")
    return AccountResponse(
        id=new_acc.id,
        user=new_acc.user,
        name=new_acc.name,
        type=new_acc.type,
        category=new_acc.category,
        account_number=new_acc.account_number,
        ifsc_code=new_acc.ifsc_code,
        bank_name=new_acc.bank_name,
        min_amount=new_acc.min_amount,
        max_amount=new_acc.max_amount,
        max_deposit=new_acc.max_deposit,
        account_for=new_acc.account_for,
        is_only_withdrawal=new_acc.is_only_withdrawal,
        qr_code_url=new_acc.qr_code_url,
        status=new_acc.status,
        is_active=new_acc.is_active,
        last_update=new_acc.last_update,
        last_update_str=last_str,
        created_at=new_acc.created_at
    )

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, acc_in: AccountUpdate, db: Session = Depends(get_db)):
    acc = db.query(BankAccount).filter(BankAccount.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    if acc_in.name is not None:
        acc.name = acc_in.name.strip().upper()
    if acc_in.type is not None:
        acc.type = acc_in.type.strip().upper()
    if acc_in.category is not None:
        acc.category = acc_in.category
    if acc_in.account_number is not None:
        acc.account_number = acc_in.account_number.strip()
    if acc_in.ifsc_code is not None:
        acc.ifsc_code = acc_in.ifsc_code.strip()
    if acc_in.bank_name is not None:
        acc.bank_name = acc_in.bank_name.strip()
    if acc_in.min_amount is not None:
        acc.min_amount = acc_in.min_amount
    if acc_in.max_amount is not None:
        acc.max_amount = acc_in.max_amount
    if acc_in.max_deposit is not None:
        acc.max_deposit = acc_in.max_deposit
    if acc_in.account_for is not None:
        acc.account_for = acc_in.account_for
    if acc_in.is_only_withdrawal is not None:
        acc.is_only_withdrawal = acc_in.is_only_withdrawal
    if acc_in.qr_code_url is not None:
        acc.qr_code_url = acc_in.qr_code_url
    if acc_in.status is not None:
        acc.status = acc_in.status
        acc.is_active = acc_in.status.lower() == "active"
    if acc_in.is_active is not None:
        acc.is_active = acc_in.is_active
        acc.status = "Active" if acc_in.is_active else "Inactive"

    acc.last_update = datetime.utcnow()
    db.commit()
    db.refresh(acc)

    last_str = acc.last_update.strftime("%d-%m-%Y %I:%M:%S %p")
    return AccountResponse(
        id=acc.id,
        user=acc.user,
        name=acc.name,
        type=acc.type,
        category=acc.category,
        account_number=acc.account_number,
        ifsc_code=acc.ifsc_code,
        bank_name=acc.bank_name,
        min_amount=acc.min_amount,
        max_amount=acc.max_amount,
        max_deposit=acc.max_deposit,
        account_for=acc.account_for,
        is_only_withdrawal=acc.is_only_withdrawal,
        qr_code_url=acc.qr_code_url,
        status=acc.status,
        is_active=acc.is_active,
        last_update=acc.last_update,
        last_update_str=last_str,
        created_at=acc.created_at
    )

@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(BankAccount).filter(BankAccount.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(acc)
    db.commit()
    return {"message": "Account deleted successfully"}
