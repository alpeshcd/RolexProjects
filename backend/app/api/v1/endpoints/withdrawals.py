from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.withdrawal import Withdrawal
from app.models.user import User
from app.models.dashboard import DashboardStat
from app.models.statement import AccountStatement
from app.schemas.withdrawal import (
    WithdrawalCreate,
    WithdrawalApprovePayload,
    WithdrawalRejectPayload,
    WithdrawalResponse,
)

router = APIRouter()

SEED_WITHDRAWALS = [
    {
        "withdrawal_id": 17495954,
        "site": "Mastan365",
        "domain": "mastan365.com",
        "username": "KAASH26",
        "master": "MASTAN99M",
        "added_by": "Kaash26",
        "account_name": "Kashyap J",
        "account_no": "020100050306026",
        "ifsc_code": "TMBL0000020",
        "bank_name": "Tamilnad Mercantile Bank",
        "amount": 6000.0,
        "type": "Client",
        "utr_number": "665428117649",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 14, 37, 18),
        "approved_at": datetime(2026, 10, 15, 14, 44, 18),
    },
    {
        "withdrawal_id": 17495479,
        "site": "Mastan99",
        "domain": "mastan99.com",
        "username": "99VARDAAN2323",
        "master": "MASTAN99M",
        "added_by": "99Vardaan2323",
        "account_name": "Mohit Kumar",
        "account_no": "8102618307",
        "ifsc_code": "AIRP0000001",
        "bank_name": "Airtel Payments Bank",
        "amount": 1100.0,
        "type": "Client",
        "utr_number": None,
        "status": "Rejected",
        "date": datetime(2026, 10, 15, 14, 22, 21),
        "rejected_at": datetime(2026, 10, 15, 14, 24, 57),
    },
    {
        "withdrawal_id": 17495305,
        "site": "Mastan99",
        "domain": "mastan99.com",
        "username": "99NIKHIL777",
        "master": "MASTAN99M",
        "added_by": "99NIKHIL777",
        "account_name": "NIKHIL",
        "account_no": "20534373169",
        "ifsc_code": "SBIN0017625",
        "bank_name": "State Bank of India",
        "amount": 1000.0,
        "type": "Client",
        "utr_number": "665400113395",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 14, 15, 44),
        "approved_at": datetime(2026, 10, 15, 14, 22, 42),
    },
    {
        "withdrawal_id": 17495239,
        "site": "Mastan99",
        "domain": "mastan99.com",
        "username": "99RAJAY6666",
        "master": "MASTAN99M",
        "added_by": "99Rajay6666",
        "account_name": "Ajay Kumar Jaiswal",
        "account_no": "39816352211",
        "ifsc_code": "SBIN0000474",
        "bank_name": "State Bank of India",
        "amount": 10000.0,
        "type": "Client",
        "utr_number": "665478923062",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 14, 13, 5),
        "approved_at": datetime(2026, 10, 15, 14, 20, 37),
    },
    {
        "withdrawal_id": 17494997,
        "site": "Mastan365",
        "domain": "mastan365.com",
        "username": "LOTUS952568350",
        "master": "MASTAN99M",
        "added_by": "LOTUS952568350",
        "account_name": "Om Parkash",
        "account_no": "110008568200",
        "ifsc_code": "CNRB0005751",
        "bank_name": "Canara Bank",
        "amount": 20340.0,
        "type": "Client",
        "utr_number": None,
        "status": "Rejected",
        "date": datetime(2026, 10, 15, 14, 4, 37),
        "rejected_at": datetime(2026, 10, 15, 14, 11, 47),
    },
    {
        "withdrawal_id": 17493999,
        "site": "Mastan365",
        "domain": "mastan365.com",
        "username": "KAASH26",
        "master": "MASTAN99M",
        "added_by": "Kaash26",
        "account_name": "Kashyap J",
        "account_no": "020100050306026",
        "ifsc_code": "TMBL0000020",
        "bank_name": "Tamilnad Mercantile Bank",
        "amount": 7000.0,
        "type": "Client",
        "utr_number": "665490812396",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 13, 23, 58),
        "approved_at": datetime(2026, 10, 15, 14, 20, 2),
    },
    {
        "withdrawal_id": 17492527,
        "site": "Mastanredd",
        "domain": "mastanreddy.com",
        "username": "PAWANCHHETRI",
        "master": "MASTAN99M",
        "added_by": "Pawanchhetri",
        "account_name": "Pawan Chhetri",
        "account_no": "21640100069051",
        "ifsc_code": "FDRL0002164",
        "bank_name": "Federal Bank",
        "amount": 500.0,
        "type": "Client",
        "utr_number": "66540614121",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 12, 27, 3),
        "approved_at": datetime(2026, 10, 15, 13, 12, 41),
    },
    {
        "withdrawal_id": 17492465,
        "site": "Mastan99",
        "domain": "mastan99.com",
        "username": "99AKASHKUMAR",
        "master": "MASTAN99M",
        "added_by": "99Akashkumar",
        "account_name": "ANKIT KUMAR",
        "account_no": "2172001700079860",
        "ifsc_code": "PUNB0217200",
        "bank_name": "Punjab National Bank",
        "amount": 1602.0,
        "type": "Client",
        "utr_number": "1000568398",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 12, 24, 34),
        "approved_at": datetime(2026, 10, 15, 12, 45, 9),
    },
    {
        "withdrawal_id": 17492203,
        "site": "Mastan99",
        "domain": "mastan99.com",
        "username": "99AKASHKUMAR",
        "master": "MASTAN99M",
        "added_by": "99Akashkumar",
        "account_name": "Rajmani Singh",
        "account_no": "2172001700082369",
        "ifsc_code": "PUNB0217200",
        "bank_name": "Punjab National Bank",
        "amount": 1602.0,
        "type": "Client",
        "utr_number": None,
        "status": "Rejected",
        "date": datetime(2026, 10, 15, 12, 14, 55),
        "rejected_at": datetime(2026, 10, 15, 12, 16, 34),
    },
    {
        "withdrawal_id": 17491880,
        "site": "Mastan99",
        "domain": "mastan99.com",
        "username": "DEVIL12",
        "master": "MASTAN99M",
        "added_by": "Devil12",
        "account_name": "Abhay Pratap Singh",
        "account_no": "38920199201",
        "ifsc_code": "SBIN0001890",
        "bank_name": "State Bank of India",
        "amount": 5000.0,
        "type": "Client",
        "utr_number": "665412890041",
        "status": "Approved",
        "date": datetime(2026, 10, 15, 11, 45, 10),
        "approved_at": datetime(2026, 10, 15, 11, 52, 30),
    },
    {
        "withdrawal_id": 17496012,
        "site": "Mastan365",
        "domain": "mastan365.com",
        "username": "KAASH26",
        "master": "MASTAN99M",
        "added_by": "Kaash26",
        "account_name": "Kashyap J",
        "account_no": "020100050306026",
        "ifsc_code": "TMBL0000020",
        "bank_name": "Tamilnad Mercantile Bank",
        "amount": 7000.0,
        "type": "Client",
        "utr_number": None,
        "status": "Pending",
        "date": datetime(2026, 10, 15, 14, 50, 0),
    },
]

def seed_withdrawals_if_empty(db: Session):
    count = db.query(Withdrawal).count()
    if count == 0:
        for w in SEED_WITHDRAWALS:
            with_rec = Withdrawal(
                withdrawal_id=w["withdrawal_id"],
                site=w["site"],
                domain=w["domain"],
                username=w["username"],
                master=w["master"],
                added_by=w["added_by"],
                account_name=w["account_name"],
                account_no=w["account_no"],
                ifsc_code=w["ifsc_code"],
                bank_name=w.get("bank_name"),
                amount=w["amount"],
                type=w["type"],
                utr_number=w.get("utr_number"),
                status=w["status"],
                date=w["date"],
                approved_at=w.get("approved_at"),
                rejected_at=w.get("rejected_at"),
                created_at=w["date"],
            )
            db.add(with_rec)
        db.commit()

@router.get("", response_model=List[WithdrawalResponse])
@router.get("/", response_model=List[WithdrawalResponse])
def get_withdrawals(
    status: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    utr_number: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    seed_withdrawals_if_empty(db)
    query = db.query(Withdrawal)

    if status and status.strip() and status.lower() not in ["all", "select status"]:
        query = query.filter(Withdrawal.status.ilike(status.strip()))

    if domain and domain.strip() and domain.lower() not in ["all", "select domain"]:
        query = query.filter((Withdrawal.domain.ilike(f"%{domain.strip()}%")) | (Withdrawal.site.ilike(f"%{domain.strip()}%")))

    if username and username.strip():
        query = query.filter(Withdrawal.username.ilike(f"%{username.strip()}%"))

    if utr_number and utr_number.strip():
        query = query.filter(Withdrawal.utr_number.ilike(f"%{utr_number.strip()}%"))

    if type and type.strip() and type.lower() not in ["all", "select type"]:
        query = query.filter(Withdrawal.type.ilike(type.strip()))

    withdrawals = query.order_by(Withdrawal.id.desc()).all()

    results = []
    for w in withdrawals:
        date_str = w.date.strftime("%d-%m-%Y %I:%M:%S %p") if w.date else None
        app_str = w.approved_at.strftime("%d-%m-%Y %I:%M:%S %p") if w.approved_at else None
        rej_str = w.rejected_at.strftime("%d-%m-%Y %I:%M:%S %p") if w.rejected_at else None
        can_str = w.canceled_at.strftime("%d-%m-%Y %I:%M:%S %p") if w.canceled_at else None

        results.append(
            WithdrawalResponse(
                id=w.id,
                withdrawal_id=w.withdrawal_id,
                site=w.site,
                domain=w.domain,
                username=w.username,
                master=w.master,
                added_by=w.added_by,
                account_name=w.account_name,
                account_no=w.account_no,
                ifsc_code=w.ifsc_code,
                bank_name=w.bank_name,
                amount=w.amount,
                type=w.type,
                utr_number=w.utr_number,
                status=w.status,
                rejection_reason=w.rejection_reason,
                date=w.date,
                date_str=date_str,
                approved_at=w.approved_at,
                approved_at_str=app_str,
                rejected_at=w.rejected_at,
                rejected_at_str=rej_str,
                canceled_at=w.canceled_at,
                canceled_at_str=can_str
            )
        )
    return results

@router.post("", response_model=WithdrawalResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=WithdrawalResponse, status_code=status.HTTP_201_CREATED)
def create_withdrawal(with_in: WithdrawalCreate, db: Session = Depends(get_db)):
    max_id = db.query(func.max(Withdrawal.withdrawal_id)).scalar() or 17496012
    next_id = max_id + 1

    clean_user = with_in.username.strip().upper()
    user_obj = db.query(User).filter(User.username.ilike(clean_user), User.role == "client").first()
    if not user_obj:
        raise HTTPException(status_code=404, detail=f"Client '{clean_user}' not found")

    # The client's own site/domain are the source of truth
    site_name = user_obj.site or with_in.site or "Mastan99"
    domain_name = user_obj.domain or "mastan99.com"

    # Check client balance
    if (user_obj.balance or 0.0) < with_in.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient client balance (Current: ₹{user_obj.balance:,.2f}, Requested: ₹{with_in.amount:,.2f})"
        )

    new_with = Withdrawal(
        withdrawal_id=next_id,
        site=site_name,
        domain=domain_name,
        username=clean_user,
        master="MASTAN99M",
        added_by=clean_user if with_in.type != "Manual" else "MASTAN99M",
        account_name=with_in.account_name,
        account_no=with_in.account_no,
        ifsc_code=with_in.ifsc_code,
        bank_name=with_in.bank_name,
        amount=with_in.amount,
        type=with_in.type or "Client",
        utr_number=with_in.utr_number,
        status="Pending",
        date=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(new_with)

    # Update dashboard pending withdrawals stat
    dash = db.query(DashboardStat).first()
    if dash:
        dash.pending_withdrawals = (dash.pending_withdrawals or 0.0) + with_in.amount
        dash.pending_withdrawals_count = (dash.pending_withdrawals_count or 0) + 1

    db.commit()
    db.refresh(new_with)

    date_str = new_with.date.strftime("%d-%m-%Y %I:%M:%S %p")
    return WithdrawalResponse(
        id=new_with.id,
        withdrawal_id=new_with.withdrawal_id,
        site=new_with.site,
        domain=new_with.domain,
        username=new_with.username,
        master=new_with.master,
        added_by=new_with.added_by,
        account_name=new_with.account_name,
        account_no=new_with.account_no,
        ifsc_code=new_with.ifsc_code,
        bank_name=new_with.bank_name,
        amount=new_with.amount,
        type=new_with.type,
        utr_number=new_with.utr_number,
        status=new_with.status,
        date=new_with.date,
        date_str=date_str
    )

@router.put("/{withdrawal_id}/approve", response_model=WithdrawalResponse)
def approve_withdrawal(withdrawal_id: int, payload: WithdrawalApprovePayload, db: Session = Depends(get_db)):
    with_rec = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    if not with_rec:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    if with_rec.status != "Pending":
        # Prevents debiting the same payout twice
        raise HTTPException(status_code=409, detail=f"Withdrawal is already {with_rec.status}")

    # Re-check funds: other payouts may have been approved since this request was made
    user = db.query(User).filter(User.username.ilike(with_rec.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Client '{with_rec.username}' not found")
    if (user.balance or 0.0) < with_rec.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient client balance (Current: ₹{user.balance or 0:,.2f}, Payout: ₹{with_rec.amount:,.2f})"
        )

    with_rec.status = "Approved"
    with_rec.utr_number = payload.utr_number.strip()
    with_rec.approved_at = datetime.utcnow()
    with_rec.rejected_at = None
    with_rec.canceled_at = None

    # Debit client balance (funds were verified above)
    if user:
        user.balance = (user.balance or 0.0) - with_rec.amount

    # Insert debit statement audit
    stmt = AccountStatement(
        site_user=f"{with_rec.username} ({with_rec.domain or 'mastan99.com'})",
        domain=with_rec.domain or "mastan99.com",
        username=with_rec.username,
        date=datetime.utcnow(),
        event_type="-",
        amount=-with_rec.amount,
        total=-with_rec.amount,
        balance=user.balance if user else 0.0,
        type="Withdraw",
        dc="Debit",
        description=f"Withdrawal Payout Settled - UTR: {with_rec.utr_number} to {with_rec.account_name} ({with_rec.account_no})",
        created_at=datetime.utcnow(),
    )
    db.add(stmt)

    # Update dashboard stats
    dash = db.query(DashboardStat).first()
    if dash:
        dash.approved_withdrawals = (dash.approved_withdrawals or 0.0) + with_rec.amount
        dash.approved_withdrawals_count = (dash.approved_withdrawals_count or 0) + 1
        dash.total_withdrawals = (dash.total_withdrawals or 0.0) + with_rec.amount
        dash.total_withdrawals_count = (dash.total_withdrawals_count or 0) + 1
        dash.pending_withdrawals = max(0.0, (dash.pending_withdrawals or 0.0) - with_rec.amount)
        dash.pending_withdrawals_count = max(0, (dash.pending_withdrawals_count or 0) - 1)

    db.commit()
    db.refresh(with_rec)

    return WithdrawalResponse(
        id=with_rec.id,
        withdrawal_id=with_rec.withdrawal_id,
        site=with_rec.site,
        domain=with_rec.domain,
        username=with_rec.username,
        master=with_rec.master,
        added_by=with_rec.added_by,
        account_name=with_rec.account_name,
        account_no=with_rec.account_no,
        ifsc_code=with_rec.ifsc_code,
        bank_name=with_rec.bank_name,
        amount=with_rec.amount,
        type=with_rec.type,
        utr_number=with_rec.utr_number,
        status=with_rec.status,
        date=with_rec.date,
        date_str=with_rec.date.strftime("%d-%m-%Y %I:%M:%S %p"),
        approved_at=with_rec.approved_at,
        approved_at_str=with_rec.approved_at.strftime("%d-%m-%Y %I:%M:%S %p")
    )

@router.put("/{withdrawal_id}/reject", response_model=WithdrawalResponse)
def reject_withdrawal(withdrawal_id: int, payload: WithdrawalRejectPayload, db: Session = Depends(get_db)):
    with_rec = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    if not with_rec:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    if with_rec.status != "Pending":
        raise HTTPException(status_code=409, detail=f"Withdrawal is already {with_rec.status}")

    with_rec.status = "Rejected"
    with_rec.rejection_reason = payload.reason
    with_rec.rejected_at = datetime.utcnow()
    with_rec.approved_at = None
    with_rec.canceled_at = None

    # Update dashboard stats
    dash = db.query(DashboardStat).first()
    if dash:
        dash.rejected_withdrawals = (dash.rejected_withdrawals or 0.0) + with_rec.amount
        dash.rejected_withdrawals_count = (dash.rejected_withdrawals_count or 0) + 1
        dash.pending_withdrawals = max(0.0, (dash.pending_withdrawals or 0.0) - with_rec.amount)
        dash.pending_withdrawals_count = max(0, (dash.pending_withdrawals_count or 0) - 1)

    db.commit()
    db.refresh(with_rec)

    return WithdrawalResponse(
        id=with_rec.id,
        withdrawal_id=with_rec.withdrawal_id,
        site=with_rec.site,
        domain=with_rec.domain,
        username=with_rec.username,
        master=with_rec.master,
        added_by=with_rec.added_by,
        account_name=with_rec.account_name,
        account_no=with_rec.account_no,
        ifsc_code=with_rec.ifsc_code,
        bank_name=with_rec.bank_name,
        amount=with_rec.amount,
        type=with_rec.type,
        utr_number=with_rec.utr_number,
        status=with_rec.status,
        rejection_reason=with_rec.rejection_reason,
        date=with_rec.date,
        date_str=with_rec.date.strftime("%d-%m-%Y %I:%M:%S %p"),
        rejected_at=with_rec.rejected_at,
        rejected_at_str=with_rec.rejected_at.strftime("%d-%m-%Y %I:%M:%S %p")
    )

@router.put("/{withdrawal_id}/cancel", response_model=WithdrawalResponse)
def cancel_withdrawal(withdrawal_id: int, db: Session = Depends(get_db)):
    with_rec = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    if not with_rec:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    if with_rec.status != "Pending":
        raise HTTPException(status_code=409, detail=f"Withdrawal is already {with_rec.status}")

    with_rec.status = "Canceled"
    with_rec.canceled_at = datetime.utcnow()

    dash = db.query(DashboardStat).first()
    if dash:
        dash.pending_withdrawals = max(0.0, (dash.pending_withdrawals or 0.0) - with_rec.amount)
        dash.pending_withdrawals_count = max(0, (dash.pending_withdrawals_count or 0) - 1)

    db.commit()
    db.refresh(with_rec)

    return WithdrawalResponse(
        id=with_rec.id,
        withdrawal_id=with_rec.withdrawal_id,
        site=with_rec.site,
        domain=with_rec.domain,
        username=with_rec.username,
        master=with_rec.master,
        added_by=with_rec.added_by,
        account_name=with_rec.account_name,
        account_no=with_rec.account_no,
        ifsc_code=with_rec.ifsc_code,
        bank_name=with_rec.bank_name,
        amount=with_rec.amount,
        type=with_rec.type,
        utr_number=with_rec.utr_number,
        status=with_rec.status,
        date=with_rec.date,
        date_str=with_rec.date.strftime("%d-%m-%Y %I:%M:%S %p"),
        canceled_at=with_rec.canceled_at,
        canceled_at_str=with_rec.canceled_at.strftime("%d-%m-%Y %I:%M:%S %p")
    )
