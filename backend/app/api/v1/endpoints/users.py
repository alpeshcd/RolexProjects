from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, time, timedelta

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.dashboard import DashboardStat
from app.models.statement import AccountStatement
from app.services.exchange.betting import user_exposure
from app.api.deps import CLIENT_ROLE, get_current_user
from app.schemas.user import UserDetail, UserCreate, ClientCreateRequest, UserUpdateBalance, UserStatusUpdate, StatsSummary

router = APIRouter()

SEED_CLIENTS = [
    {"client_id": 2619778, "username": "DEVIL12", "master": "MASTAN99M", "mobile": "*****38675", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 3, "source": "Signup", "balance": 45000.0, "is_active": True, "created_at": datetime(2026, 10, 15, 13, 38, 37)},
    {"client_id": 2619722, "username": "99RANAJI", "master": "MASTAN99M", "mobile": "-", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 1, "source": "Manual", "balance": 18500.0, "is_active": True, "created_at": datetime(2026, 10, 15, 13, 26, 40)},
    {"client_id": 2619695, "username": "365A7055417680", "master": "MASTAN99M", "mobile": "-", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 13, 18, 2)},
    {"client_id": 2619649, "username": "365MANOJ78", "master": "MASTAN99M", "mobile": "-", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 13, 1, 17)},
    {"client_id": 2619520, "username": "365MANDEEP3726", "master": "MASTAN99M", "mobile": "-", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 12, 13, 38)},
    {"client_id": 2619495, "username": "365MANAS1580", "master": "MASTAN99M", "mobile": "-", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 11, 59, 44)},
    {"client_id": 2619459, "username": "365MANISHCHAUHAN2126", "master": "MASTAN99M", "mobile": "-", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 11, 41, 18)},
    {"client_id": 2619415, "username": "365MANISH29JANGU", "master": "MASTAN99M", "mobile": "-", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 11, 20, 32)},
    {"client_id": 2619369, "username": "99MANIKK", "master": "MASTAN99M", "mobile": "-", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 0, "source": "Manual", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 15, 11, 4, 42)},
    {"client_id": 2619213, "username": "NOBITANOBI8417", "master": "MASTAN99M", "mobile": "*****48417", "site": "Mastanredd", "domain": "mastanreddy.com", "deposit_count": 0, "source": "Signup", "balance": 12000.0, "is_active": True, "created_at": datetime(2026, 10, 15, 10, 3, 28)},
    {"client_id": 2619009, "username": "SHIVCHARANCHAUDHARY", "master": "MASTAN99M", "mobile": "*****04636", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 0, "source": "Signup", "balance": 8500.0, "is_active": True, "created_at": datetime(2026, 10, 15, 6, 46, 57)},
    {"client_id": 2618999, "username": "NIRAJ12345", "master": "MASTAN99M", "mobile": "*****28936", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 2, "source": "Signup", "balance": 32000.0, "is_active": True, "created_at": datetime(2026, 10, 15, 6, 36, 3)},
    {"client_id": 2618874, "username": "99RANA97", "master": "MASTAN99M", "mobile": "-", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 1, "source": "Manual", "balance": 15000.0, "is_active": True, "created_at": datetime(2026, 10, 15, 1, 10, 41)},
    {"client_id": 2618659, "username": "ASHUTOSH", "master": "MASTAN99M", "mobile": "*****78589", "site": "Mastan365", "domain": "mastan365.com", "deposit_count": 0, "source": "Signup", "balance": 5000.0, "is_active": True, "created_at": datetime(2026, 10, 14, 23, 12, 54)},
    {"client_id": 2618394, "username": "99RANA98", "master": "MASTAN99M", "mobile": "-", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 1, "source": "Manual", "balance": 21000.0, "is_active": True, "created_at": datetime(2026, 10, 14, 21, 59, 24)},
    {"client_id": 2618345, "username": "ZZZAABDB", "master": "MASTAN99M", "mobile": "*****45067", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 0, "source": "Signup", "balance": 0.0, "is_active": True, "created_at": datetime(2026, 10, 14, 21, 50, 11)},
    {"client_id": 2618781, "username": "HIRA1987", "master": "MASTAN99M", "mobile": "*****70118", "site": "Mastan99", "domain": "mastan99.com", "deposit_count": 0, "source": "Signup", "balance": 9500.0, "is_active": True, "created_at": datetime(2026, 10, 14, 20, 26, 26)},
]

def seed_clients_if_needed(db: Session):
    existing_count = db.query(User).filter(User.client_id.isnot(None)).count()
    if existing_count == 0:
        default_pwd = get_password_hash("Password123!")
        for item in SEED_CLIENTS:
            u = User(
                username=item["username"],
                full_name=item["username"],
                email=f"{item['username'].lower()}@{item['domain']}",
                hashed_password=default_pwd,
                role="client",
                balance=item["balance"],
                client_id=item["client_id"],
                mobile=item["mobile"],
                master=item["master"],
                site=item["site"],
                domain=item["domain"],
                deposit_count=item["deposit_count"],
                source=item["source"],
                is_active=item["is_active"],
                is_2fa_enabled=False,
                created_at=item["created_at"],
                updated_at=item["created_at"]
            )
            db.add(u)
        
        # Also sync total clients into dashboard stats
        dash = db.query(DashboardStat).first()
        if dash:
            dash.new_clients = len(SEED_CLIENTS)

        db.commit()

@router.get("", response_model=List[UserDetail])
def get_users(
    domain: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    deposit_count: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None, description="Created on or after this day (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Created on or before this day (YYYY-MM-DD), inclusive"),
    db: Session = Depends(get_db)
):
    seed_clients_if_needed(db)
    # Staff accounts (admin, operators, extra users) are not clients
    query = db.query(User).filter(User.role == CLIENT_ROLE)

    if domain and domain.strip() and domain.lower() not in ["all", "select domain"]:
        d = domain.strip().lower()
        query = query.filter((User.domain.ilike(f"%{d}%")) | (User.site.ilike(f"%{d}%")))
    
    if username and username.strip():
        u = username.strip().lower()
        query = query.filter(User.username.ilike(f"%{u}%"))

    if source and source.strip() and source.lower() not in ["all", "select source"]:
        query = query.filter(User.source.ilike(source.strip()))

    if deposit_count is not None:
        query = query.filter(User.deposit_count == deposit_count)

    if start_date:
        query = query.filter(User.created_at >= datetime.combine(start_date, time.min))

    if end_date:
        query = query.filter(User.created_at < datetime.combine(end_date + timedelta(days=1), time.min))

    # Order so latest client_id / created_at is first
    users = query.order_by(User.client_id.desc().nullslast(), User.id.desc()).all()

    # Format created_on
    results = []
    for u in users:
        formatted_date = u.created_at.strftime("%d-%m-%Y %I:%M:%S %p") if u.created_at else None
        item = UserDetail(
            id=u.id,
            username=u.username,
            full_name=u.full_name,
            email=u.email,
            role=u.role,
            balance=u.balance or 0.0,
            upline_share=u.upline_share or 0.0,
            upline=u.upline,
            domain=u.domain,
            client_id=u.client_id,
            mobile=u.mobile or "-",
            master=u.master or "MASTAN99M",
            site=u.site or (u.domain.split('.')[0].capitalize() if u.domain else "Mastan99"),
            deposit_count=u.deposit_count or 0,
            source=u.source or "Manual",
            referral_code=u.referral_code,
            is_active=u.is_active,
            is_2fa_enabled=u.is_2fa_enabled,
            created_at=u.created_at,
            created_on=formatted_date
        )
        results.append(item)

    return results

@router.post("/client", response_model=UserDetail, status_code=status.HTTP_201_CREATED)
def create_client_from_form(client_in: ClientCreateRequest, db: Session = Depends(get_db)):
    clean_username = client_in.username.strip().upper()
    existing = db.query(User).filter(User.username.ilike(clean_username)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{clean_username}' already exists"
        )
    
    # Extract site and domain from master string, e.g. "Mastan777(mastan247.club)"
    master_str = client_in.master.strip()
    site_name = "Mastan99"
    domain_name = "mastan99.com"

    if "247" in master_str:
        site_name = "Mastan247"
        domain_name = "mastan247.club"
    elif "365" in master_str:
        site_name = "Mastan365"
        domain_name = "mastan365.com"
    elif "reddy" in master_str.lower():
        site_name = "Mastanredd"
        domain_name = "mastanreddy.com"
    elif "99" in master_str:
        site_name = "Mastan99"
        domain_name = "mastan99.com"

    # Compute next client_id
    max_id = db.query(func.max(User.client_id)).scalar() or 2619778
    next_client_id = max_id + 1

    new_client = User(
        username=clean_username,
        full_name=clean_username,
        email=f"{clean_username.lower()}@{domain_name}",
        hashed_password=get_password_hash(client_in.password),
        role="client",
        balance=client_in.balance or 0.0,
        client_id=next_client_id,
        mobile=client_in.mobile or "-",
        master="MASTAN99M",
        site=site_name,
        domain=domain_name,
        deposit_count=0,
        source="Manual",
        referral_code=client_in.referral_code,
        is_active=True,
        is_2fa_enabled=False
    )
    db.add(new_client)

    # Sync dashboard stats client count
    dash = db.query(DashboardStat).first()
    if dash:
        dash.new_clients = (dash.new_clients or 0) + 1

    db.commit()
    db.refresh(new_client)

    formatted_date = new_client.created_at.strftime("%d-%m-%Y %I:%M:%S %p")
    return UserDetail(
        id=new_client.id,
        username=new_client.username,
        full_name=new_client.full_name,
        email=new_client.email,
        role=new_client.role,
        balance=new_client.balance,
        upline_share=new_client.upline_share,
        upline=new_client.upline,
        domain=new_client.domain,
        client_id=new_client.client_id,
        mobile=new_client.mobile,
        master=new_client.master,
        site=new_client.site,
        deposit_count=new_client.deposit_count,
        source=new_client.source,
        referral_code=new_client.referral_code,
        is_active=new_client.is_active,
        is_2fa_enabled=new_client.is_2fa_enabled,
        created_at=new_client.created_at,
        created_on=formatted_date
    )

@router.post("", response_model=UserDetail, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username.ilike(user_in.username.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    is_client = (user_in.role or "").lower() == CLIENT_ROLE
    next_client_id = None
    if is_client:
        max_id = db.query(func.max(User.client_id)).scalar() or 2619778
        next_client_id = user_in.client_id or max_id + 1

    new_user = User(
        username=user_in.username.strip().upper(),
        full_name=user_in.full_name or user_in.username.strip(),
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "operator",
        balance=user_in.balance or 0.0,
        upline_share=user_in.upline_share or 0.0,
        upline=user_in.upline or "DIRECT",
        domain=user_in.domain or "mastan99.com",
        client_id=next_client_id,
        mobile=user_in.mobile or "-",
        master=user_in.master or "MASTAN99M",
        site=user_in.site or "Mastan99",
        deposit_count=user_in.deposit_count or 0,
        source=user_in.source or "Manual",
        referral_code=user_in.referral_code,
        is_2fa_enabled=user_in.is_2fa_enabled,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}/balance", response_model=UserDetail)
def update_user_balance(
    user_id: int,
    bal: UserUpdateBalance,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id, User.role == CLIENT_ROLE).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    is_debit = bal.operation == "withdraw"
    if is_debit:
        if (user.balance or 0.0) - user_exposure(db, user) < bal.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance (open bets hold part of it)")
        user.balance = (user.balance or 0.0) - bal.amount
    else:
        user.balance = (user.balance or 0.0) + bal.amount
        user.deposit_count = (user.deposit_count or 0) + 1

    # Keep the A/C statement in step with the balance
    domain = user.domain or "mastan99.com"
    db.add(AccountStatement(
        site_user=f"{user.username} ({domain})",
        domain=domain,
        username=user.username,
        date=datetime.utcnow(),
        event_type="-",
        amount=-bal.amount if is_debit else bal.amount,
        total=-bal.amount if is_debit else bal.amount,
        balance=user.balance,
        type="Withdraw" if is_debit else "Deposit",
        dc="Debit" if is_debit else "Credit",
        description=f"Manual balance {'debit' if is_debit else 'credit'} by {current_user.username}",
        created_at=datetime.utcnow(),
    ))

    db.commit()
    db.refresh(user)
    return user

@router.get("/staff", response_model=List[UserDetail])
def get_staff(db: Session = Depends(get_db)):
    """Admin-panel users (Extra Users page): everyone who is not a client."""
    return (
        db.query(User)
        .filter(User.role != CLIENT_ROLE)
        .order_by(User.created_at.desc(), User.id.desc())
        .all()
    )

@router.put("/{user_id}/status", response_model=UserDetail)
def update_staff_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id, User.role != CLIENT_ROLE).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id and not payload.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot suspend your own account")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user

@router.get("/stats/summary", response_model=StatsSummary)
def get_stats_summary(db: Session = Depends(get_db)):
    clients = db.query(User).filter(User.role == CLIENT_ROLE)
    total_clients = clients.count()
    active_clients = clients.filter(User.is_active == True).count()
    total_bal = clients.with_entities(func.sum(User.balance)).scalar() or 0.0
    total_upline = clients.with_entities(func.sum(User.upline_share)).scalar() or 0.0

    return StatsSummary(
        total_clients=total_clients,
        total_balance=float(total_bal),
        total_upline_share=float(total_upline),
        active_clients=active_clients
    )
