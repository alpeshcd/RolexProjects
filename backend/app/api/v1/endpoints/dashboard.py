from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dashboard import DashboardStat
from app.schemas.dashboard import DashboardStatsResponse, DashboardStatsUpdate

router = APIRouter()

def get_or_create_stats(db: Session) -> DashboardStat:
    stat = db.query(DashboardStat).first()
    if not stat:
        stat = DashboardStat(
            new_clients=12,
            total_ftd=0.0,
            total_ftd_count=0,
            total_deposits=76720.0,
            total_deposits_count=59,
            approved_deposits=59120.0,
            approved_deposits_count=37,
            rejected_deposits=17600.0,
            rejected_deposits_count=22,
            total_withdrawals=182810.0,
            total_withdrawals_count=24,
            pending_withdrawals=7000.0,
            pending_withdrawals_count=1,
            approved_withdrawals=147283.0,
            approved_withdrawals_count=17,
            rejected_withdrawals=28527.0,
            rejected_withdrawals_count=6
        )
        db.add(stat)
        db.commit()
        db.refresh(stat)
    return stat

@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(db: Session = Depends(get_db)):
    stat = get_or_create_stats(db)
    return stat

@router.put("/stats", response_model=DashboardStatsResponse)
def update_stats(update_data: DashboardStatsUpdate, db: Session = Depends(get_db)):
    stat = get_or_create_stats(db)
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(stat, field, value)
    db.commit()
    db.refresh(stat)
    return stat
