from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, time, timedelta

from app.core.database import get_db
from app.models.deposit import Deposit, UTREntry
from app.models.user import User
from app.models.dashboard import DashboardStat
from app.models.statement import AccountStatement
from app.schemas.deposit import (
    DepositCreate,
    DepositUpdateStatus,
    DepositResponse,
    UTREntryCreate,
    UTREntryResponse,
)

router = APIRouter()

SEED_DEPOSITS = [
    {"deposit_id": 46055811, "site": "Mastan99", "domain": "mastan99.com", "username": "99VARDAAN2323", "master": "MASTAN99M", "added_by": "99Vardaan2323", "amount": 300.0, "type": "Client", "utr_number": "056918412285", "status": "Approved", "date": datetime(2026, 10, 15, 13, 51, 51), "approved_at": datetime(2026, 10, 15, 13, 53, 5)},
    {"deposit_id": 46055506, "site": "Mastan365", "domain": "mastan365.com", "username": "DEVIL12", "master": "MASTAN99M", "added_by": "Devil12", "amount": 1000.0, "type": "Client", "utr_number": "134749220880", "status": "Approved", "date": datetime(2026, 10, 15, 13, 46, 21), "approved_at": datetime(2026, 10, 15, 13, 47, 0)},
    {"deposit_id": 46055386, "site": "Mastan365", "domain": "mastan365.com", "username": "DEVIL12", "master": "MASTAN99M", "added_by": "Devil12", "amount": 2000.0, "type": "Client", "utr_number": "043642695134", "status": "Approved", "date": datetime(2026, 10, 15, 13, 44, 8), "approved_at": datetime(2026, 10, 15, 13, 45, 18)},
    {"deposit_id": 46055335, "site": "Mastan365", "domain": "mastan365.com", "username": "DEVIL12", "master": "MASTAN99M", "added_by": "Devil12", "amount": 2000.0, "type": "Client", "utr_number": "103865373217", "status": "Approved", "date": datetime(2026, 10, 15, 13, 43, 22), "approved_at": datetime(2026, 10, 15, 13, 43, 45)},
    {"deposit_id": 46055233, "site": "Mastan365", "domain": "mastan365.com", "username": "DEVIL12", "master": "MASTAN99M", "added_by": "Devil12", "amount": 5000.0, "type": "Client", "utr_number": "103865373217", "status": "Rejected", "date": datetime(2026, 10, 15, 13, 41, 19), "rejected_at": datetime(2026, 10, 15, 13, 42, 13)},
    {"deposit_id": 46054459, "site": "Mastan99", "domain": "mastan99.com", "username": "99RANAJI", "master": "MASTAN99M", "added_by": "MASTAN99M", "amount": 1000.0, "type": "Manual", "utr_number": "896546321567", "status": "Approved", "date": datetime(2026, 10, 15, 13, 27, 2), "approved_at": datetime(2026, 10, 15, 13, 27, 2)},
    {"deposit_id": 46053934, "site": "Mastan365", "domain": "mastan365.com", "username": "365MANOJ78", "master": "MASTAN99M", "added_by": "365Manoj78", "amount": 1000.0, "type": "Client", "utr_number": "909628219026", "status": "Rejected", "date": datetime(2026, 10, 15, 13, 16, 50), "rejected_at": datetime(2026, 10, 15, 13, 17, 36)},
    {"deposit_id": 46053302, "site": "Mastan365", "domain": "mastan365.com", "username": "KAASH26", "master": "MASTAN99M", "added_by": "Kaash26", "amount": 6000.0, "type": "Client", "utr_number": "628811929253", "status": "Approved", "date": datetime(2026, 10, 15, 13, 2, 59), "approved_at": datetime(2026, 10, 15, 13, 4, 50)},
    {"deposit_id": 46052965, "site": "Mastan365", "domain": "mastan365.com", "username": "MAYURSINH", "master": "MASTAN99M", "added_by": "Mayursinh", "amount": 1000.0, "type": "Client", "utr_number": "651592634421", "status": "Approved", "date": datetime(2026, 10, 15, 12, 54, 58), "approved_at": datetime(2026, 10, 15, 12, 55, 30)},
    {"deposit_id": 46052934, "site": "Mastan365", "domain": "mastan365.com", "username": "MAYURSINH", "master": "MASTAN99M", "added_by": "Mayursinh", "amount": 2000.0, "type": "Client", "utr_number": "831558303907", "status": "Approved", "date": datetime(2026, 10, 15, 12, 54, 19), "approved_at": datetime(2026, 10, 15, 12, 55, 48)},
    {"deposit_id": 46052838, "site": "Mastan365", "domain": "mastan365.com", "username": "LOTUS952568350", "master": "MASTAN99M", "added_by": "LOTUS952568350", "amount": 4000.0, "type": "Client", "utr_number": "628864514318", "status": "Approved", "date": datetime(2026, 10, 15, 12, 51, 57), "approved_at": datetime(2026, 10, 15, 12, 52, 43)},
    {"deposit_id": 46052568, "site": "Mastanredd", "domain": "mastanreddy.com", "username": "SANNI000", "master": "MASTAN99M", "added_by": "Sanni000", "amount": 1000.0, "type": "Client", "utr_number": "316876849717", "status": "Rejected", "date": datetime(2026, 10, 15, 12, 46, 11), "rejected_at": datetime(2026, 10, 15, 12, 46, 55)},
    {"deposit_id": 46052204, "site": "Mastan365", "domain": "mastan365.com", "username": "LOTUS952568350", "master": "MASTAN99M", "added_by": "LOTUS952568350", "amount": 10500.0, "type": "Client", "utr_number": "628807114603", "status": "Approved", "date": datetime(2026, 10, 15, 12, 38, 41), "approved_at": datetime(2026, 10, 15, 12, 39, 26)},
    {"deposit_id": 46052060, "site": "Mastan365", "domain": "mastan365.com", "username": "MAYURSINH", "master": "MASTAN99M", "added_by": "Mayursinh", "amount": 2000.0, "type": "Client", "utr_number": "411091649639", "status": "Approved", "date": datetime(2026, 10, 15, 12, 35, 36), "approved_at": datetime(2026, 10, 15, 12, 36, 59)},
    {"deposit_id": 46052003, "site": "Mastan365", "domain": "mastan365.com", "username": "MAYURSINH", "master": "MASTAN99M", "added_by": "Mayursinh", "amount": 2000.0, "type": "Client", "utr_number": "992081234482", "status": "Approved", "date": datetime(2026, 10, 15, 12, 34, 30), "approved_at": datetime(2026, 10, 15, 12, 36, 33)},
    {"deposit_id": 46051535, "site": "Mastan99", "domain": "mastan99.com", "username": "AJ9266765908", "master": "MASTAN99M", "added_by": "AJ9266765908", "amount": 200.0, "type": "Client", "utr_number": "616083147775", "status": "Approved", "date": datetime(2026, 10, 15, 12, 24, 13), "approved_at": datetime(2026, 10, 15, 12, 24, 46)},
    {"deposit_id": 46050586, "site": "Mastanredd", "domain": "mastanreddy.com", "username": "PAWANCHHETRI", "master": "MASTAN99M", "added_by": "Pawanchhetri", "amount": 100.0, "type": "Client", "utr_number": "616082019758", "status": "Approved", "date": datetime(2026, 10, 15, 12, 5, 4), "approved_at": datetime(2026, 10, 15, 12, 7, 20)},
]

SEED_UTRS = [
    {"utr_id": 41484405, "master": "MASTAN99M", "added_by": "MASTAN99M", "account_name": "Rajbir Dalal #", "utr_number": "128312682015", "amount": 750.00, "status": "PENDING", "date": datetime(2026, 8, 27, 13, 26, 37)},
    {"utr_id": 37503720, "master": "MASTAN99M", "added_by": "MASTAN99M", "account_name": "Kureshi Samir Kalubhai #", "utr_number": "943742596046", "amount": 2200.00, "status": "PENDING", "date": datetime(2026, 7, 19, 17, 28, 49)},
]

def seed_deposits_if_empty(db: Session):
    count = db.query(Deposit).count()
    if count == 0:
        for d in SEED_DEPOSITS:
            dep = Deposit(
                deposit_id=d["deposit_id"],
                site=d["site"],
                domain=d["domain"],
                username=d["username"],
                master=d["master"],
                added_by=d["added_by"],
                amount=d["amount"],
                type=d["type"],
                utr_number=d["utr_number"],
                status=d["status"],
                date=d["date"],
                approved_at=d.get("approved_at"),
                rejected_at=d.get("rejected_at"),
                created_at=d["date"]
            )
            db.add(dep)
        db.commit()

    utr_count = db.query(UTREntry).count()
    if utr_count == 0:
        for u in SEED_UTRS:
            ent = UTREntry(
                utr_id=u["utr_id"],
                master=u["master"],
                added_by=u["added_by"],
                account_name=u["account_name"],
                utr_number=u["utr_number"],
                amount=u["amount"],
                status=u["status"],
                date=u["date"],
                created_at=u["date"]
            )
            db.add(ent)
        db.commit()

@router.get("", response_model=List[DepositResponse])
def get_deposits(
    status: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    utr_number: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    account_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None, description="On or after this day (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Up to and including this day (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    seed_deposits_if_empty(db)
    query = db.query(Deposit)

    if status and status.strip() and status.lower() not in ["all", "select status"]:
        query = query.filter(Deposit.status.ilike(status.strip()))

    if domain and domain.strip() and domain.lower() not in ["all", "select domain"]:
        query = query.filter((Deposit.domain.ilike(f"%{domain.strip()}%")) | (Deposit.site.ilike(f"%{domain.strip()}%")))

    if username and username.strip():
        query = query.filter(Deposit.username.ilike(f"%{username.strip()}%"))

    if utr_number and utr_number.strip():
        query = query.filter(Deposit.utr_number.ilike(f"%{utr_number.strip()}%"))

    if type and type.strip() and type.lower() not in ["all", "select type"]:
        query = query.filter(Deposit.type.ilike(type.strip()))

    if account_id is not None:
        query = query.filter(Deposit.account_id == account_id)

    if start_date:
        query = query.filter(Deposit.date >= datetime.combine(start_date, time.min))

    if end_date:
        query = query.filter(Deposit.date < datetime.combine(end_date + timedelta(days=1), time.min))

    deposits = query.order_by(Deposit.id.desc()).all()

    results = []
    for d in deposits:
        date_str = d.date.strftime("%d-%m-%Y %I:%M:%S %p") if d.date else None
        app_str = d.approved_at.strftime("%d-%m-%Y %I:%M:%S %p") if d.approved_at else None
        rej_str = d.rejected_at.strftime("%d-%m-%Y %I:%M:%S %p") if d.rejected_at else None

        results.append(
            DepositResponse(
                id=d.id,
                deposit_id=d.deposit_id,
                site=d.site,
                domain=d.domain,
                username=d.username,
                master=d.master,
                added_by=d.added_by,
                account_id=d.account_id,
                account_name=d.account_name,
                amount=d.amount,
                type=d.type,
                utr_number=d.utr_number,
                status=d.status,
                proof_image_url=d.proof_image_url,
                date=d.date,
                date_str=date_str,
                approved_at=d.approved_at,
                approved_at_str=app_str,
                rejected_at=d.rejected_at,
                rejected_at_str=rej_str
            )
        )
    return results

@router.post("", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
def create_deposit(dep_in: DepositCreate, db: Session = Depends(get_db)):
    max_id = db.query(func.max(Deposit.deposit_id)).scalar() or 46055811
    next_id = max_id + 1

    clean_user = dep_in.username.strip().upper()
    user_obj = db.query(User).filter(User.username.ilike(clean_user), User.role == "client").first()
    if not user_obj:
        raise HTTPException(status_code=404, detail=f"Client '{clean_user}' not found")

    # The client's own site/domain are the source of truth
    site_name = user_obj.site or dep_in.site or "Mastan99"
    domain_name = user_obj.domain or "mastan99.com"

    new_dep = Deposit(
        deposit_id=next_id,
        site=site_name,
        domain=domain_name,
        username=clean_user,
        master="MASTAN99M",
        added_by=clean_user if dep_in.type != "Manual" else "MASTAN99M",
        account_id=dep_in.account_id,
        account_name=dep_in.account_name,
        amount=dep_in.amount,
        type=dep_in.type or "Client",
        utr_number=dep_in.utr_number.strip(),
        status="Pending",
        proof_image_url=dep_in.proof_image_url,
        date=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(new_dep)

    # Check for matching pending UTR entry
    matching_utr = db.query(UTREntry).filter(
        (UTREntry.utr_number == dep_in.utr_number.strip()) &
        (UTREntry.status == "PENDING")
    ).first()
    if matching_utr:
        matching_utr.status = "MATCHED"

    db.commit()
    db.refresh(new_dep)

    date_str = new_dep.date.strftime("%d-%m-%Y %I:%M:%S %p")
    return DepositResponse(
        id=new_dep.id,
        deposit_id=new_dep.deposit_id,
        site=new_dep.site,
        domain=new_dep.domain,
        username=new_dep.username,
        master=new_dep.master,
        added_by=new_dep.added_by,
        account_id=new_dep.account_id,
        account_name=new_dep.account_name,
        amount=new_dep.amount,
        type=new_dep.type,
        utr_number=new_dep.utr_number,
        status=new_dep.status,
        proof_image_url=new_dep.proof_image_url,
        date=new_dep.date,
        date_str=date_str
    )

@router.put("/{deposit_id}/approve", response_model=DepositResponse)
def approve_deposit(deposit_id: int, db: Session = Depends(get_db)):
    dep = db.query(Deposit).filter(Deposit.id == deposit_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Deposit not found")
    if dep.status != "Pending":
        # Prevents crediting the same deposit twice
        raise HTTPException(status_code=409, detail=f"Deposit is already {dep.status}")

    dep.status = "Approved"
    dep.approved_at = datetime.utcnow()
    dep.rejected_at = None

    # Tightly credit client balance!
    user = db.query(User).filter(User.username.ilike(dep.username)).first()
    if user:
        user.balance = (user.balance or 0.0) + dep.amount
        user.deposit_count = (user.deposit_count or 0) + 1

    # Create audit record in account statement
    stmt = AccountStatement(
        site_user=f"{dep.username} ({dep.domain or 'mastan99.com'})",
        domain=dep.domain or "mastan99.com",
        username=dep.username,
        date=datetime.utcnow(),
        event_type="-",
        amount=dep.amount,
        total=dep.amount,
        balance=user.balance if user else dep.amount,
        type="Deposit",
        dc="Credit",
        description=f"Deposit Confirmed - Ref UTR: {dep.utr_number} [ID: {dep.deposit_id}]",
        created_at=datetime.utcnow(),
    )
    db.add(stmt)

    # Update dashboard stats
    dash = db.query(DashboardStat).first()
    if dash:
        dash.approved_deposits = (dash.approved_deposits or 0.0) + dep.amount
        dash.approved_deposits_count = (dash.approved_deposits_count or 0) + 1
        dash.total_deposits = (dash.total_deposits or 0.0) + dep.amount
        dash.total_deposits_count = (dash.total_deposits_count or 0) + 1

    db.commit()
    db.refresh(dep)

    return DepositResponse(
        id=dep.id,
        deposit_id=dep.deposit_id,
        site=dep.site,
        domain=dep.domain,
        username=dep.username,
        master=dep.master,
        added_by=dep.added_by,
        amount=dep.amount,
        type=dep.type,
        utr_number=dep.utr_number,
        status=dep.status,
        proof_image_url=dep.proof_image_url,
        date=dep.date,
        date_str=dep.date.strftime("%d-%m-%Y %I:%M:%S %p"),
        approved_at=dep.approved_at,
        approved_at_str=dep.approved_at.strftime("%d-%m-%Y %I:%M:%S %p") if dep.approved_at else None
    )

@router.put("/{deposit_id}/reject", response_model=DepositResponse)
def reject_deposit(deposit_id: int, db: Session = Depends(get_db)):
    dep = db.query(Deposit).filter(Deposit.id == deposit_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Deposit not found")
    if dep.status != "Pending":
        raise HTTPException(status_code=409, detail=f"Deposit is already {dep.status}")

    dep.status = "Rejected"
    dep.rejected_at = datetime.utcnow()

    dash = db.query(DashboardStat).first()
    if dash:
        dash.rejected_deposits = (dash.rejected_deposits or 0.0) + dep.amount
        dash.rejected_deposits_count = (dash.rejected_deposits_count or 0) + 1

    db.commit()
    db.refresh(dep)

    return DepositResponse(
        id=dep.id,
        deposit_id=dep.deposit_id,
        site=dep.site,
        domain=dep.domain,
        username=dep.username,
        master=dep.master,
        added_by=dep.added_by,
        amount=dep.amount,
        type=dep.type,
        utr_number=dep.utr_number,
        status=dep.status,
        proof_image_url=dep.proof_image_url,
        date=dep.date,
        date_str=dep.date.strftime("%d-%m-%Y %I:%M:%S %p"),
        rejected_at=dep.rejected_at,
        rejected_at_str=dep.rejected_at.strftime("%d-%m-%Y %I:%M:%S %p") if dep.rejected_at else None
    )

# --- UTR ENTRY ENDPOINTS (Screenshots 3, 4, 5) ---

@router.get("/utrs", response_model=List[UTREntryResponse])
def get_utrs(status: Optional[str] = Query("PENDING"), utr_number: Optional[str] = Query(None), db: Session = Depends(get_db)):
    seed_deposits_if_empty(db)
    query = db.query(UTREntry)

    if status and status.strip() and status.lower() != "all":
        query = query.filter(UTREntry.status.ilike(status.strip()))

    if utr_number and utr_number.strip():
        query = query.filter(UTREntry.utr_number.ilike(f"%{utr_number.strip()}%"))

    utrs = query.order_by(UTREntry.id.desc()).all()
    results = []
    for u in utrs:
        results.append(
            UTREntryResponse(
                id=u.id,
                utr_id=u.utr_id,
                master=u.master,
                added_by=u.added_by,
                account_name=u.account_name,
                utr_number=u.utr_number,
                amount=u.amount,
                status=u.status,
                removed_by=u.removed_by,
                date=u.date,
                date_str=u.date.strftime("%d-%m-%Y %I:%M:%S %p") if u.date else None
            )
        )
    return results

@router.post("/utrs", response_model=UTREntryResponse, status_code=status.HTTP_201_CREATED)
def create_utr_entry(utr_in: UTREntryCreate, db: Session = Depends(get_db)):
    max_id = db.query(func.max(UTREntry.utr_id)).scalar() or 41484405
    next_id = max_id + 1

    clean_utr = utr_in.utr_number.strip()
    new_utr = UTREntry(
        utr_id=next_id,
        master="MASTAN99M",
        added_by="MASTAN99M",
        account_name=utr_in.account_name.strip(),
        utr_number=clean_utr,
        amount=utr_in.amount,
        status="PENDING",
        date=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(new_utr)

    # Check if any pending client deposit matches this UTR
    matching_deposit = db.query(Deposit).filter(
        (Deposit.utr_number == clean_utr) &
        (Deposit.status == "Pending")
    ).first()
    if matching_deposit:
        new_utr.status = "MATCHED"

    db.commit()
    db.refresh(new_utr)

    return UTREntryResponse(
        id=new_utr.id,
        utr_id=new_utr.utr_id,
        master=new_utr.master,
        added_by=new_utr.added_by,
        account_name=new_utr.account_name,
        utr_number=new_utr.utr_number,
        amount=new_utr.amount,
        status=new_utr.status,
        date=new_utr.date,
        date_str=new_utr.date.strftime("%d-%m-%Y %I:%M:%S %p")
    )

@router.delete("/utrs/{utr_id}", response_model=UTREntryResponse)
def remove_utr_entry(utr_id: int, db: Session = Depends(get_db)):
    utr = db.query(UTREntry).filter(UTREntry.id == utr_id).first()
    if not utr:
        raise HTTPException(status_code=404, detail="UTR entry not found")

    utr.status = "REMOVED"
    utr.removed_by = "MASTAN99M"
    db.commit()
    db.refresh(utr)

    return UTREntryResponse(
        id=utr.id,
        utr_id=utr.utr_id,
        master=utr.master,
        added_by=utr.added_by,
        account_name=utr.account_name,
        utr_number=utr.utr_number,
        amount=utr.amount,
        status=utr.status,
        removed_by=utr.removed_by,
        date=utr.date,
        date_str=utr.date.strftime("%d-%m-%Y %I:%M:%S %p") if utr.date else None
    )
