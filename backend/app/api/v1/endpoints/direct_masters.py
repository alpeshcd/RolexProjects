"""Direct Master Management.

A "direct master" is one admin/master account on an exchange that we buy points
for from a purchase party and hand over to a seller party, with optional broker
(third party) commissions in between.

ASSUMPTIONS (confirm with the client before relying on the money figures):
  * spread           = purchase_rate - seller_rate
  * total_commission = plain sum of the third-party commission percentages
  * net_spread       = spread minus total_commission% *of the spread*
Change `_derive` below once the client confirms the real commission base.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.direct_master import Party, DirectMaster, DirectMasterThirdParty
from app.schemas.direct_master import (
    PartyCreate, PartyUpdate, PartyResponse,
    DirectMasterCreate, DirectMasterUpdate, DirectMasterResponse,
    ThirdPartyResponse,
)

router = APIRouter()

SEED_PARTIES = [
    {"name": "RAJ ENTERPRISE", "type": "Purchase"},
    {"name": "SHREE TRADERS", "type": "Purchase"},
    {"name": "AK CORPORATION", "type": "Seller"},
    {"name": "VIJAY ASSOCIATES", "type": "Seller"},
    {"name": "MEHUL BROKING", "type": "Third"},
    {"name": "SAGAR AGENCY", "type": "All"},
]


def seed_parties_if_empty(db: Session):
    if db.query(Party).count() == 0:
        for p in SEED_PARTIES:
            db.add(Party(name=p["name"], type=p["type"], is_active=True))
        db.commit()


# --------------------------------------------------------------------------
# Parties
# --------------------------------------------------------------------------

@router.get("/parties", response_model=List[PartyResponse])
def get_parties(
    type: Optional[str] = Query(None, description="Purchase | Seller | Third"),
    only_active: bool = Query(True),
    db: Session = Depends(get_db),
):
    seed_parties_if_empty(db)
    query = db.query(Party)

    if only_active:
        query = query.filter(Party.is_active.is_(True))

    # A party typed "All" is usable in every dropdown.
    if type and type.strip() and type.strip().lower() != "all":
        t = type.strip()
        query = query.filter((Party.type.ilike(t)) | (Party.type.ilike("All")))

    return query.order_by(Party.name.asc()).all()


@router.post("/parties", response_model=PartyResponse, status_code=status.HTTP_201_CREATED)
def create_party(party_in: PartyCreate, db: Session = Depends(get_db)):
    name = party_in.name.strip().upper()
    if not name:
        raise HTTPException(status_code=400, detail="Party name is required")

    existing = db.query(Party).filter(Party.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Party '{name}' already exists")

    party = Party(
        name=name,
        type=party_in.type or "All",
        contact=party_in.contact.strip() if party_in.contact else None,
        notes=party_in.notes,
        is_active=party_in.is_active,
    )
    db.add(party)
    db.commit()
    db.refresh(party)
    return party


@router.put("/parties/{party_id}", response_model=PartyResponse)
def update_party(party_id: int, party_in: PartyUpdate, db: Session = Depends(get_db)):
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    if party_in.name is not None:
        party.name = party_in.name.strip().upper()
    if party_in.type is not None:
        party.type = party_in.type
    if party_in.contact is not None:
        party.contact = party_in.contact.strip()
    if party_in.notes is not None:
        party.notes = party_in.notes
    if party_in.is_active is not None:
        party.is_active = party_in.is_active

    db.commit()
    db.refresh(party)
    return party


@router.delete("/parties/{party_id}")
def delete_party(party_id: int, db: Session = Depends(get_db)):
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    in_use = (
        db.query(DirectMaster)
        .filter(
            (DirectMaster.purchase_party_id == party_id)
            | (DirectMaster.seller_party_id == party_id)
        )
        .count()
        or db.query(DirectMasterThirdParty)
        .filter(DirectMasterThirdParty.party_id == party_id)
        .count()
    )
    if in_use:
        raise HTTPException(
            status_code=400,
            detail="Party is used by existing Direct Master records. Deactivate it instead.",
        )

    db.delete(party)
    db.commit()
    return {"message": "Party deleted successfully"}


# --------------------------------------------------------------------------
# Direct Master records
# --------------------------------------------------------------------------

def _derive(purchase_rate: float, seller_rate: float, rows: List[DirectMasterThirdParty]):
    spread = round((purchase_rate or 0.0) - (seller_rate or 0.0), 6)
    total_commission = round(sum((r.commission or 0.0) for r in rows), 4)
    net_spread = round(spread * (1 - total_commission / 100.0), 6)
    return spread, total_commission, net_spread


def _serialize(dm: DirectMaster) -> DirectMasterResponse:
    spread, total_commission, net_spread = _derive(
        dm.purchase_rate, dm.seller_rate, dm.third_parties
    )
    return DirectMasterResponse(
        id=dm.id,
        exchange=dm.exchange,
        exchange_title=dm.exchange_title,
        admin=dm.admin,
        purchase_party_id=dm.purchase_party_id,
        purchase_party_name=dm.purchase_party.name if dm.purchase_party else None,
        purchase_rate=dm.purchase_rate,
        seller_party_id=dm.seller_party_id,
        seller_party_name=dm.seller_party.name if dm.seller_party else None,
        seller_rate=dm.seller_rate,
        credit=dm.credit,
        status=dm.status,
        is_active=dm.is_active,
        third_parties=[
            ThirdPartyResponse(
                id=r.id,
                party_id=r.party_id,
                party_name=r.party.name if r.party else None,
                commission=r.commission,
            )
            for r in dm.third_parties
        ],
        spread=spread,
        total_commission=total_commission,
        net_spread=net_spread,
        created_at=dm.created_at,
        created_at_str=dm.created_at.strftime("%d-%m-%Y %I:%M:%S %p") if dm.created_at else None,
    )


def _validate_party(db: Session, party_id: int, label: str) -> Party:
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=400, detail=f"{label} not found")
    return party


@router.get("", response_model=List[DirectMasterResponse])
def get_direct_masters(
    exchange: Optional[str] = Query(None),
    admin: Optional[str] = Query(None),
    party_id: Optional[int] = Query(None, description="Matches purchase, seller or third party"),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(DirectMaster)

    if exchange and exchange.strip() and exchange.strip().lower() not in ("all", "select exchange"):
        query = query.filter(DirectMaster.exchange.ilike(exchange.strip()))

    if admin and admin.strip():
        query = query.filter(DirectMaster.admin.ilike(f"%{admin.strip()}%"))

    if status and status.strip() and status.strip().lower() != "all":
        query = query.filter(DirectMaster.status.ilike(status.strip()))

    if party_id:
        third_ids = [
            r.direct_master_id
            for r in db.query(DirectMasterThirdParty)
            .filter(DirectMasterThirdParty.party_id == party_id)
            .all()
        ]
        query = query.filter(
            (DirectMaster.purchase_party_id == party_id)
            | (DirectMaster.seller_party_id == party_id)
            | (DirectMaster.id.in_(third_ids or [-1]))
        )

    return [_serialize(dm) for dm in query.order_by(DirectMaster.id.desc()).all()]


@router.get("/{master_id}", response_model=DirectMasterResponse)
def get_direct_master(master_id: int, db: Session = Depends(get_db)):
    dm = db.query(DirectMaster).filter(DirectMaster.id == master_id).first()
    if not dm:
        raise HTTPException(status_code=404, detail="Direct Master record not found")
    return _serialize(dm)


@router.post("", response_model=DirectMasterResponse, status_code=status.HTTP_201_CREATED)
def create_direct_master(dm_in: DirectMasterCreate, db: Session = Depends(get_db)):
    if not dm_in.admin.strip():
        raise HTTPException(status_code=400, detail="Admin name is required")

    _validate_party(db, dm_in.purchase_party_id, "Purchase party")
    _validate_party(db, dm_in.seller_party_id, "Seller party")

    is_act = (dm_in.status or "Active").lower() == "active"
    dm = DirectMaster(
        exchange=dm_in.exchange.strip(),
        exchange_title=dm_in.exchange_title,
        admin=dm_in.admin.strip().upper(),
        purchase_party_id=dm_in.purchase_party_id,
        purchase_rate=dm_in.purchase_rate,
        seller_party_id=dm_in.seller_party_id,
        seller_rate=dm_in.seller_rate,
        credit=dm_in.credit,
        status="Active" if is_act else "Inactive",
        is_active=is_act,
    )
    db.add(dm)
    db.flush()  # need dm.id for the child rows

    for row in dm_in.third_parties:
        _validate_party(db, row.party_id, "Third party")
        db.add(
            DirectMasterThirdParty(
                direct_master_id=dm.id,
                party_id=row.party_id,
                commission=row.commission or 0.0,
            )
        )

    db.commit()
    db.refresh(dm)
    return _serialize(dm)


@router.put("/{master_id}", response_model=DirectMasterResponse)
def update_direct_master(master_id: int, dm_in: DirectMasterUpdate, db: Session = Depends(get_db)):
    dm = db.query(DirectMaster).filter(DirectMaster.id == master_id).first()
    if not dm:
        raise HTTPException(status_code=404, detail="Direct Master record not found")

    if dm_in.exchange is not None:
        dm.exchange = dm_in.exchange.strip()
    if dm_in.exchange_title is not None:
        dm.exchange_title = dm_in.exchange_title
    if dm_in.admin is not None:
        dm.admin = dm_in.admin.strip().upper()
    if dm_in.purchase_party_id is not None:
        _validate_party(db, dm_in.purchase_party_id, "Purchase party")
        dm.purchase_party_id = dm_in.purchase_party_id
    if dm_in.purchase_rate is not None:
        dm.purchase_rate = dm_in.purchase_rate
    if dm_in.seller_party_id is not None:
        _validate_party(db, dm_in.seller_party_id, "Seller party")
        dm.seller_party_id = dm_in.seller_party_id
    if dm_in.seller_rate is not None:
        dm.seller_rate = dm_in.seller_rate
    if dm_in.credit is not None:
        dm.credit = dm_in.credit
    if dm_in.status is not None:
        dm.status = dm_in.status
        dm.is_active = dm_in.status.lower() == "active"

    if dm_in.third_parties is not None:
        dm.third_parties.clear()
        db.flush()
        for row in dm_in.third_parties:
            _validate_party(db, row.party_id, "Third party")
            dm.third_parties.append(
                DirectMasterThirdParty(party_id=row.party_id, commission=row.commission or 0.0)
            )

    db.commit()
    db.refresh(dm)
    return _serialize(dm)


@router.delete("/{master_id}")
def delete_direct_master(master_id: int, db: Session = Depends(get_db)):
    dm = db.query(DirectMaster).filter(DirectMaster.id == master_id).first()
    if not dm:
        raise HTTPException(status_code=404, detail="Direct Master record not found")
    db.delete(dm)
    db.commit()
    return {"message": "Direct Master record deleted successfully"}
