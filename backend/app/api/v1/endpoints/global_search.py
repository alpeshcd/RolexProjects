from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.portal import DomainPortal
from app.models.user import User
from app.schemas.portal import (
    PortalResponse,
    GlobalSearchClient,
    CreatePortalClient,
    CreatePortal,
    UpdatePortal,
)

router = APIRouter()

DEFAULT_PORTALS = [
    {
        "domain_key": "mastan247",
        "domain_title": "MASTAN777(MASTAN247)",
        "domain_url": "mastan247.club",
        "brand_name": "MASTAN 247",
        "balance": 1728434.0,
        "pl": 762427.2,
        "client_wallet": 9138.88,
    },
    {
        "domain_key": "mastan365",
        "domain_title": "MASTAN365M(MASTAN365)",
        "domain_url": "mastan365.com",
        "brand_name": "MASTAN365",
        "balance": 2290040.9,
        "pl": 252893.61,
        "client_wallet": 22504.44,
    },
    {
        "domain_key": "mastan99",
        "domain_title": "MASTAN99M(MASTAN99)",
        "domain_url": "mastan99.com",
        "brand_name": "MASTAN99",
        "balance": 1352545.72,
        "pl": 3624238.48,
        "client_wallet": 95517.0,
    },
    {
        "domain_key": "mastanreddy",
        "domain_title": "MASTANREDDYMAS(MASTAN REDD)",
        "domain_url": "mastanreddy.com",
        "brand_name": "MASTANREDDY CLUB",
        "balance": 2255503.9,
        "pl": 401452.84,
        "client_wallet": 11487.32,
    },
]

def seed_portals_if_empty(db: Session):
    count = db.query(DomainPortal).count()
    if count == 0:
        for p in DEFAULT_PORTALS:
            portal = DomainPortal(
                domain_key=p["domain_key"],
                domain_title=p["domain_title"],
                domain_url=p["domain_url"],
                brand_name=p["brand_name"],
                balance=p["balance"],
                pl=p["pl"],
                client_wallet=p["client_wallet"],
                is_active=True
            )
            db.add(portal)
        db.commit()

@router.get("/portals", response_model=List[PortalResponse])
def get_portals(db: Session = Depends(get_db)):
    seed_portals_if_empty(db)
    return db.query(DomainPortal).order_by(DomainPortal.id.asc()).all()

@router.post("/portals", response_model=PortalResponse, status_code=status.HTTP_201_CREATED)
def create_portal(portal_in: CreatePortal, db: Session = Depends(get_db)):
    existing = db.query(DomainPortal).filter(
        (DomainPortal.domain_key == portal_in.domain_key.strip().lower()) |
        (DomainPortal.domain_url == portal_in.domain_url.strip().lower())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Domain or Key already exists")
    
    new_portal = DomainPortal(
        domain_key=portal_in.domain_key.strip().lower(),
        domain_title=portal_in.domain_title.strip(),
        domain_url=portal_in.domain_url.strip().lower(),
        brand_name=portal_in.brand_name.strip(),
        balance=portal_in.balance or 0.0,
        pl=portal_in.pl or 0.0,
        client_wallet=portal_in.client_wallet or 0.0,
        is_active=portal_in.is_active if portal_in.is_active is not None else True
    )
    db.add(new_portal)
    db.commit()
    db.refresh(new_portal)
    return new_portal

@router.put("/portals/{portal_id}", response_model=PortalResponse)
def update_portal(portal_id: int, portal_in: UpdatePortal, db: Session = Depends(get_db)):
    portal = db.query(DomainPortal).filter(DomainPortal.id == portal_id).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")
    
    if portal_in.domain_title is not None:
        portal.domain_title = portal_in.domain_title
    if portal_in.domain_url is not None:
        portal.domain_url = portal_in.domain_url
    if portal_in.brand_name is not None:
        portal.brand_name = portal_in.brand_name
    if portal_in.balance is not None:
        portal.balance = portal_in.balance
    if portal_in.pl is not None:
        portal.pl = portal_in.pl
    if portal_in.client_wallet is not None:
        portal.client_wallet = portal_in.client_wallet
    if portal_in.is_active is not None:
        portal.is_active = portal_in.is_active
    
    portal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portal)
    return portal

@router.delete("/portals/{portal_id}")
def delete_portal(portal_id: int, db: Session = Depends(get_db)):
    portal = db.query(DomainPortal).filter(DomainPortal.id == portal_id).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")
    db.delete(portal)
    db.commit()
    return {"message": "Portal deleted successfully"}

@router.post("/portals/{portal_id}/refresh", response_model=PortalResponse)
def refresh_portal(portal_id: int, db: Session = Depends(get_db)):
    portal = db.query(DomainPortal).filter(DomainPortal.id == portal_id).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")
    portal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portal)
    return portal

@router.get("", response_model=List[GlobalSearchClient])
def search_clients(
    domain: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Only return clients when a search filter (domain or username) has been submitted,
    # or return all matching records. If no criteria provided, return empty list to match "No Data Available In Table"
    if not domain and not username:
        return []

    query = db.query(User)

    if domain and domain.strip() and domain.lower() not in ["all", "select domain", ""]:
        d_val = domain.strip().lower()
        # Support searching by domain url, key, or title
        query = query.filter(
            (User.domain.ilike(f"%{d_val}%")) | 
            (User.upline.ilike(f"%{d_val}%"))
        )

    if username and username.strip():
        u_val = username.strip().lower()
        query = query.filter(
            (User.username.ilike(f"%{u_val}%")) | 
            (User.full_name.ilike(f"%{u_val}%"))
        )

    users = query.order_by(User.id.asc()).all()

    # Map portal titles
    portals = db.query(DomainPortal).all()
    portal_map = {p.domain_url.lower(): p.domain_title for p in portals}
    for p in portals:
        portal_map[p.domain_key.lower()] = p.domain_title

    results = []
    for idx, u in enumerate(users, start=1):
        dom = u.domain or "mastan99.com"
        dom_title = portal_map.get(dom.lower(), dom)
        updated_str = u.updated_at.strftime("%Y-%m-%d %H:%M:%S") if u.updated_at else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        results.append(
            GlobalSearchClient(
                id=u.id,
                s_no=idx,
                domain=dom,
                domain_title=dom_title,
                username=u.username,
                full_name=u.full_name,
                balance=u.balance or 0.0,
                last_updated=updated_str,
                is_active=u.is_active
            )
        )
    return results

@router.post("/clients", response_model=GlobalSearchClient, status_code=status.HTTP_201_CREATED)
def create_portal_client(client_in: CreatePortalClient, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username.ilike(client_in.username.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    clean_domain = client_in.domain.strip()
    new_user = User(
        username=client_in.username.strip().upper(),
        full_name=client_in.full_name or client_in.username.strip(),
        email=f"{client_in.username.strip().lower()}@{clean_domain or 'rolex.win'}",
        hashed_password=get_password_hash(client_in.password),
        role="client",
        balance=client_in.balance or 0.0,
        domain=clean_domain,
        upline=client_in.upline or "DIRECT",
        upline_share=client_in.upline_share or 0.0,
        is_active=True,
        is_2fa_enabled=False
    )
    db.add(new_user)

    # Also update matching portal client wallet
    matching_portal = db.query(DomainPortal).filter(
        (DomainPortal.domain_url.ilike(f"%{clean_domain}%")) |
        (DomainPortal.domain_key.ilike(f"%{clean_domain}%")) |
        (DomainPortal.domain_title.ilike(f"%{clean_domain}%"))
    ).first()
    if matching_portal and client_in.balance:
        matching_portal.client_wallet = (matching_portal.client_wallet or 0.0) + client_in.balance

    db.commit()
    db.refresh(new_user)

    return GlobalSearchClient(
        id=new_user.id,
        s_no=1,
        domain=new_user.domain or clean_domain,
        domain_title=matching_portal.domain_title if matching_portal else clean_domain,
        username=new_user.username,
        full_name=new_user.full_name,
        balance=new_user.balance or 0.0,
        last_updated=new_user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        is_active=new_user.is_active
    )
