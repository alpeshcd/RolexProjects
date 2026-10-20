"""Master-panel accounts on a Mastan domain portal, and the clients under them.

Hierarchy: admin (one per portal) -> super masters -> masters -> clients.
Admins, super masters and masters are ExchangeAccount rows; clients are the
Rolex `users` rows of that portal's domain, so a deposit approved in Rolex
shows up in the panel straight away and the other way round.
"""
import re
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.exchange import ExchangeAccount
from app.models.portal import DomainPortal
from app.models.user import User
from app.api.deps import CLIENT_ROLE
from app.api.v1.endpoints.global_search import seed_portals_if_empty

ROLE_LABELS = {"admin": "Admin", "supermaster": "Super Master", "master": "Master", "client": "Client"}

# Which account types each role may create, top-down as in the Mastan panel
CHILD_ROLES = {"admin": ["supermaster", "master"], "supermaster": ["master"], "master": ["client"]}


def find_portal(db: Session, host: str) -> Optional[DomainPortal]:
    """Match a browser host to a portal: mastan365.localhost, mastan365.com, admin.mastan365.com."""
    seed_portals_if_empty(db)
    host = (host or "").split(":")[0].strip().lower()
    for p in db.query(DomainPortal).filter(DomainPortal.is_active == True).all():  # noqa: E712
        url = p.domain_url.lower()
        if host in (p.domain_key, url) or host.endswith("." + url) or host.startswith(p.domain_key + "."):
            return p
    return None


def portal_of(db: Session, account: ExchangeAccount) -> DomainPortal:
    return db.query(DomainPortal).filter(DomainPortal.domain_key == account.domain_key).first()


def admin_username(portal: DomainPortal) -> str:
    # "MASTAN365M(MASTAN365)" -> "MASTAN365M"
    name = re.sub(r"[^A-Z0-9_]", "", portal.domain_title.split("(")[0].upper())
    return name or f"{portal.domain_key.upper()}M"


def ensure_admin_account(db: Session, portal: DomainPortal) -> ExchangeAccount:
    admin = db.query(ExchangeAccount).filter(
        ExchangeAccount.domain_key == portal.domain_key, ExchangeAccount.role == "admin"
    ).first()
    if admin:
        return admin
    username = admin_username(portal)
    if db.query(ExchangeAccount).filter(ExchangeAccount.username == username).first():
        username = f"{username}_{portal.domain_key.upper()}"
    admin = ExchangeAccount(
        domain_key=portal.domain_key,
        username=username,
        full_name=portal.brand_name,
        hashed_password=get_password_hash(settings.EXCHANGE_DEMO_PASSWORD),
        role="admin",
        partnership=100.0,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def get_balance(db: Session, account: ExchangeAccount) -> float:
    if account.role == "admin":
        return portal_of(db, account).balance or 0.0
    return account.balance or 0.0


def set_balance(db: Session, account: ExchangeAccount, value: float) -> None:
    if account.role == "admin":
        portal_of(db, account).balance = value
    else:
        account.balance = value


def username_taken(db: Session, username: str) -> bool:
    return bool(
        db.query(ExchangeAccount).filter(func.upper(ExchangeAccount.username) == username).first()
        or db.query(User).filter(func.upper(User.username) == username).first()
    )


def portal_accounts(db: Session, domain_key: str) -> list[ExchangeAccount]:
    return db.query(ExchangeAccount).filter(ExchangeAccount.domain_key == domain_key).all()


def subtree(db: Session, account: ExchangeAccount) -> list[ExchangeAccount]:
    """Every account below `account` (not including it)."""
    children: dict[int, list[ExchangeAccount]] = {}
    for a in portal_accounts(db, account.domain_key):
        if a.parent_id is not None:
            children.setdefault(a.parent_id, []).append(a)
    out, stack = [], [account.id]
    while stack:
        for child in children.get(stack.pop(), []):
            out.append(child)
            stack.append(child.id)
    return out


def portal_clients(db: Session, portal: DomainPortal):
    return db.query(User).filter(
        User.role == CLIENT_ROLE, func.lower(User.domain) == portal.domain_url.lower()
    )


def clients_below(db: Session, portal: DomainPortal, account: ExchangeAccount, below: list[ExchangeAccount]) -> list[User]:
    """Clients anywhere under `account`. The admin owns every client of the domain."""
    q = portal_clients(db, portal)
    if account.role != "admin":
        names = [account.username] + [a.username for a in below]
        q = q.filter(func.upper(User.master).in_(names))
    return q.order_by(User.id.desc()).all()


def direct_clients(db: Session, portal: DomainPortal, account: ExchangeAccount) -> list[User]:
    """Clients whose master is `account`. Clients whose master isn't a panel
    account (e.g. added from Rolex) sit directly under the admin."""
    q = portal_clients(db, portal)
    if account.role == "admin":
        others = [a.username for a in portal_accounts(db, account.domain_key) if a.role != "admin"]
        q = q.filter(func.upper(func.coalesce(User.master, "")).notin_(others))
    else:
        q = q.filter(func.upper(User.master) == account.username)
    return q.order_by(User.id.desc()).all()
