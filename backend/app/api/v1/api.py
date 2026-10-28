from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.api.v1.endpoints import auth, users, dashboard, global_search, accounts, deposits, withdrawals, statements, exchange, exchange_downline, exchange_bets, player

api_router = APIRouter()

# Everything except /auth requires a signed-in staff user.
protected = [Depends(get_current_user)]

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Clients"], dependencies=protected)
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"], dependencies=protected)
api_router.include_router(global_search.router, prefix="/global-search", tags=["Global Search"], dependencies=protected)
api_router.include_router(accounts.router, prefix="/accounts", tags=["Bank & Payment Accounts"], dependencies=protected)
api_router.include_router(deposits.router, prefix="/deposits", tags=["Deposits & UTR Verification"], dependencies=protected)
api_router.include_router(withdrawals.router, prefix="/withdrawals", tags=["Withdrawals & Payouts"], dependencies=protected)
api_router.include_router(statements.router, prefix="/statements", tags=["Statements & Stats"], dependencies=protected)

# Mastan master panel. Signs in its own accounts (see get_exchange_account), not Rolex staff.
api_router.include_router(exchange.router, prefix="/exchange", tags=["Mastan Panel"])
api_router.include_router(exchange_downline.router, prefix="/exchange", tags=["Mastan Panel"])
api_router.include_router(exchange_bets.router, prefix="/exchange", tags=["Mastan Panel"])

# Player site. Signs in clients (see get_player).
api_router.include_router(player.router, prefix="/player", tags=["Player Site"])


