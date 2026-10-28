"""Mastan master panel: downline list, create user, chip D/W, lock, A/C statement."""
from datetime import date, datetime, time, timedelta
from typing import List, Literal, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_exchange_account
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.dashboard import DashboardStat
from app.models.exchange import ExchangeAccount, ExchangeTransaction
from app.models.statement import AccountStatement
from app.models.user import User
from app.schemas.exchange import (
    ChipTransfer,
    DownlineCreate,
    DownlinePassword,
    DownlineRow,
    DownlineStatus,
    PanelStatementRow,
)
from app.services.exchange.accounts import (
    CHILD_ROLES,
    ROLE_LABELS,
    clients_below,
    direct_clients,
    get_balance,
    portal_accounts,
    portal_of,
    set_balance,
    subtree,
    username_taken,
)
from app.services.exchange.betting import exposures, user_exposure

router = APIRouter()

Kind = Literal["account", "client"]


def account_row(db: Session, a: ExchangeAccount, parent: Optional[str]) -> DownlineRow:
    balance = round(get_balance(db, a), 2)
    return DownlineRow(
        kind="account",
        id=a.id,
        username=a.username,
        full_name=a.full_name,
        role=a.role,
        role_label=ROLE_LABELS[a.role],
        parent=parent,
        credit_reference=a.credit_reference or 0.0,
        balance=balance,
        exposure=0.0,
        available=balance,
        pl=0.0,
        partnership=a.partnership or 0.0,
        is_active=a.is_active,
        created_at=a.created_at,
    )


def client_row(u: User, exposure: float = 0.0) -> DownlineRow:
    balance = round(u.balance or 0.0, 2)
    return DownlineRow(
        kind="client",
        id=u.id,
        username=u.username,
        full_name=u.full_name,
        role="client",
        role_label=ROLE_LABELS["client"],
        parent=u.master,
        credit_reference=0.0,
        balance=balance,
        exposure=exposure,
        available=round(balance - exposure, 2),
        pl=0.0,
        partnership=0.0,
        is_active=u.is_active,
        created_at=u.created_at,
    )


def find_target(db: Session, account: ExchangeAccount, kind: Kind, target_id: int,
                direct_only: bool) -> Union[ExchangeAccount, User]:
    """A user in `account`'s downline. Chips only move between parent and direct child."""
    portal = portal_of(db, account)
    below = subtree(db, account)
    if kind == "account":
        target = next((a for a in below if a.id == target_id), None)
        if target and direct_only and target.parent_id != account.id:
            target = None
    else:
        pool = direct_clients(db, portal, account) if direct_only else clients_below(db, portal, account, below)
        target = next((c for c in pool if c.id == target_id), None)
    if not target:
        detail = "User is not your direct downline" if direct_only else "User not found in your downline"
        raise HTTPException(status_code=404, detail=detail)
    return target


def row_for(db: Session, kind: Kind, target: Union[ExchangeAccount, User]) -> DownlineRow:
    if kind == "client":
        return client_row(target, user_exposure(db, target))
    parent = db.query(ExchangeAccount).filter(ExchangeAccount.id == target.parent_id).first()
    return account_row(db, target, parent.username if parent else None)


@router.get("/downline", response_model=List[DownlineRow])
def list_downline(
    scope: Literal["downline", "supermaster", "blocked"] = Query("downline"),
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    portal = portal_of(db, account)
    below = sorted(subtree(db, account), key=lambda a: a.id, reverse=True)
    names = {a.id: a.username for a in portal_accounts(db, account.domain_key)}

    if scope == "downline":
        accounts = [a for a in below if a.parent_id == account.id]
        clients = direct_clients(db, portal, account)
    elif scope == "supermaster":
        accounts = [a for a in below if a.role == "supermaster"]
        clients = []
    else:
        accounts = [a for a in below if not a.is_active]
        clients = [c for c in clients_below(db, portal, account, below) if not c.is_active]

    held = exposures(db, [c.id for c in clients])
    return ([account_row(db, a, names.get(a.parent_id)) for a in accounts]
            + [client_row(c, held.get(c.id, 0.0)) for c in clients])


@router.post("/downline", response_model=DownlineRow, status_code=status.HTTP_201_CREATED)
def create_downline(
    req: DownlineCreate,
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    if req.role not in CHILD_ROLES.get(account.role, []):
        raise HTTPException(
            status_code=403,
            detail=f"{ROLE_LABELS[account.role]} accounts can't create {ROLE_LABELS[req.role]} accounts",
        )
    username = req.username.strip().upper()
    if username_taken(db, username):
        raise HTTPException(status_code=400, detail=f"Username '{username}' already exists")
    portal = portal_of(db, account)

    if req.role == "client":
        max_id = db.query(func.max(User.client_id)).scalar() or 2619778
        user = User(
            username=username,
            full_name=(req.full_name or "").strip() or username,
            email=f"{username.lower()}@{portal.domain_url}",
            hashed_password=get_password_hash(req.password),
            role="client",
            balance=0.0,
            upline=account.username,
            upline_share=0.0,
            domain=portal.domain_url,
            client_id=max_id + 1,
            mobile=(req.mobile or "").strip() or "-",
            master=account.username,
            site=portal.domain_key.capitalize(),
            deposit_count=0,
            source="Panel",
            is_active=True,
            is_2fa_enabled=False,
        )
        db.add(user)
        dash = db.query(DashboardStat).first()
        if dash:
            dash.new_clients = (dash.new_clients or 0) + 1
        db.commit()
        db.refresh(user)
        return client_row(user)

    if req.partnership > (account.partnership or 0.0):
        raise HTTPException(
            status_code=400,
            detail=f"Partnership can't be more than your own ({account.partnership or 0:g}%)",
        )
    child = ExchangeAccount(
        domain_key=account.domain_key,
        username=username,
        full_name=(req.full_name or "").strip() or username,
        hashed_password=get_password_hash(req.password),
        role=req.role,
        parent_id=account.id,
        balance=0.0,
        credit_reference=req.credit_reference,
        partnership=req.partnership,
    )
    db.add(child)
    db.commit()
    db.refresh(child)
    return account_row(db, child, account.username)


@router.post("/downline/{kind}/{target_id}/chips", response_model=DownlineRow)
def transfer_chips(
    kind: Kind,
    target_id: int,
    req: ChipTransfer,
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    target = find_target(db, account, kind, target_id, direct_only=True)
    deposit = req.action == "deposit"
    amount = round(req.amount, 2)
    mine = get_balance(db, account)
    theirs = get_balance(db, target) if kind == "account" else (target.balance or 0.0)
    # A client's open bets hold part of their balance as exposure
    free = theirs - (user_exposure(db, target) if kind == "client" else 0.0)

    if deposit and mine < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient balance (Available: {mine:,.2f})")
    if not deposit and free < amount:
        raise HTTPException(status_code=400, detail=f"{target.username} has only {free:,.2f} available")

    mine, theirs = (mine - amount, theirs + amount) if deposit else (mine + amount, theirs - amount)
    set_balance(db, account, mine)
    if kind == "account":
        set_balance(db, target, theirs)
    else:
        target.balance = theirs

    now = datetime.utcnow()
    remark = f" - {req.remark.strip()}" if req.remark and req.remark.strip() else ""
    db.add(ExchangeTransaction(
        account_id=account.id,
        counterparty=target.username,
        dc="Debit" if deposit else "Credit",
        amount=amount,
        balance=mine,
        description=f"Chips {'deposited to' if deposit else 'withdrawn from'} {target.username}{remark}",
        created_at=now,
    ))
    if kind == "account":
        db.add(ExchangeTransaction(
            account_id=target.id,
            counterparty=account.username,
            dc="Credit" if deposit else "Debit",
            amount=amount,
            balance=theirs,
            description=f"Chips {'received from' if deposit else 'withdrawn by'} {account.username}{remark}",
            created_at=now,
        ))
    else:
        # A client's ledger is the Rolex A/C statement, so operators there see panel transfers too
        portal = portal_of(db, account)
        db.add(AccountStatement(
            site_user=f"{target.username} ({portal.domain_url})",
            domain=portal.domain_url,
            username=target.username,
            date=now,
            event_type="-",
            amount=amount if deposit else -amount,
            total=amount if deposit else -amount,
            balance=theirs,
            type="Deposit" if deposit else "Withdraw",
            dc="Credit" if deposit else "Debit",
            description=f"Chips {'credited' if deposit else 'debited'} by {account.username} (Mastan panel){remark}",
            created_at=now,
        ))
    db.commit()
    db.refresh(target)
    return row_for(db, kind, target)


@router.put("/downline/{kind}/{target_id}/status", response_model=DownlineRow)
def set_downline_status(
    kind: Kind,
    target_id: int,
    req: DownlineStatus,
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    target = find_target(db, account, kind, target_id, direct_only=False)
    target.is_active = req.is_active
    db.commit()
    db.refresh(target)
    return row_for(db, kind, target)


@router.put("/downline/{kind}/{target_id}/password")
def set_downline_password(
    kind: Kind,
    target_id: int,
    req: DownlinePassword,
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    target = find_target(db, account, kind, target_id, direct_only=False)
    target.hashed_password = get_password_hash(req.password)
    db.commit()
    return {"message": f"Password changed for {target.username}"}


@router.get("/statement", response_model=List[PanelStatementRow])
def statement(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    account: ExchangeAccount = Depends(get_exchange_account),
    db: Session = Depends(get_db),
):
    q = db.query(ExchangeTransaction).filter(ExchangeTransaction.account_id == account.id)
    if start_date:
        q = q.filter(ExchangeTransaction.created_at >= datetime.combine(start_date, time.min))
    if end_date:
        q = q.filter(ExchangeTransaction.created_at < datetime.combine(end_date + timedelta(days=1), time.min))
    return [
        PanelStatementRow(
            id=t.id,
            date=t.created_at,
            counterparty=t.counterparty,
            description=t.description,
            credit=t.amount if t.dc == "Credit" else 0.0,
            debit=t.amount if t.dc == "Debit" else 0.0,
            balance=t.balance,
        )
        for t in q.order_by(ExchangeTransaction.id.desc()).all()
    ]
