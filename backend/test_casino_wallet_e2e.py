"""End-to-end test of the casino Operator wallet API (Platform -> Operator).

Walks the whole contract the client's spec defines, against a running backend,
with a throwaway client account that is removed again at the end:

  1  Api-Key is enforced                        -> INVALID_API_KEY
  2  GET  /accounts/balance/{player_id}
  3  balance works without a session token      (rounds settle after sessions)
  4  POST /accounts/exposure                    -> hold shows up in the balance
  5  a stale exposure version is discarded
  6  a newer version replaces the hold
  7  exposure beyond the balance                -> INSUFFICIENT_FUNDS
  8  an unknown session token                   -> TOKEN_EXPIRED
  9  POST /accounts/settlement                  -> hold released, pl applied
 10  the same settlement replayed               -> no second movement
 11  POST /accounts/rollback                    -> reversal + resettlement
 12  rollback replayed                          -> no second movement
 13  seamless debit / credit / rollback
 14  a blocked account                          -> ACCOUNT_BLOCKED
 15  a malformed body                           -> 400 REQUEST_DECLINED, not 422

Run the backend with CASINO_OPERATOR_API_KEY set, then:

    CASINO_OPERATOR_API_KEY=<key> ./venv/bin/python test_casino_wallet_e2e.py

Environment:
    BASE_URL                  default http://localhost:8001
    CASINO_OPERATOR_API_KEY   must match the running backend's key
"""
import os
import sys
import uuid

import httpx

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal  # noqa: E402
from app.models.casino import CasinoBet, CasinoRoundExposure, CasinoSession, CasinoTransaction  # noqa: E402
from app.models.statement import AccountStatement  # noqa: E402
from app.models.user import User  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.services.casino import wallet  # noqa: E402

BASE_URL = os.getenv("BASE_URL", "http://localhost:8001").rstrip("/")
API_KEY = os.getenv("CASINO_OPERATOR_API_KEY", "")
WALLET = f"{BASE_URL}/casino/operator"

PLAYER = "CASINO_E2E"
START_BALANCE = 10000.0
ROUND_ID = 990011
GAME_ID = 1

passed, failed = 0, 0


def check(label, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  \033[32m✓\033[0m {label}")
    else:
        failed += 1
        print(f"  \033[31m✗\033[0m {label}  {detail}")


def step(title):
    print(f"\n\033[1m{title}\033[0m")


def uid():
    return str(uuid.uuid4())


def headers(token=None, key=API_KEY):
    h = {"Content-Type": "application/json"}
    if key is not None:
        h["Api-Key"] = key
    if token:
        h["Player-Session-ID"] = token
    return h


def bet(bet_id, amount, exposure, odds="1.80", **extra):
    row = {
        "id": bet_id,
        "selection_id": "player_a",
        "selection_name": "Player A",
        "amount": amount,
        "exposure": exposure,
        "odds": odds,
        "round_id": ROUND_ID,
        "game_id": GAME_ID,
        "game_name": "Teenpatti One Day",
        "status": "ACCEPTED",
        "inserted_at": "2026-01-06T12:37:46.232784Z",
        "updated_at": "2026-01-06T12:37:46.232784Z",
        "type": "BACK",
        "ip": "127.0.0.1",
        "currency_code": "INR",
        "agent_id": 2,
    }
    row.update(extra)
    return row


# ---- fixtures ----------------------------------------------------------

def cleanup(db):
    """Remove everything this test created, so it can be run repeatedly."""
    user = db.query(User).filter(User.username == PLAYER).first()
    db.query(CasinoSession).filter(CasinoSession.player_id == PLAYER).delete()
    db.query(CasinoRoundExposure).filter(CasinoRoundExposure.player_id == PLAYER).delete()
    db.query(CasinoTransaction).filter(CasinoTransaction.player_id == PLAYER).delete()
    db.query(CasinoBet).filter(CasinoBet.player_id == PLAYER).delete()
    db.query(AccountStatement).filter(AccountStatement.username == PLAYER).delete()
    if user:
        db.delete(user)
    db.commit()


def setup(db):
    cleanup(db)
    user = User(
        username=PLAYER,
        full_name="Casino E2E Player",
        hashed_password=get_password_hash("CasinoE2E@123"),
        role="client",
        balance=START_BALANCE,
        domain="mastan365.com",
        master="MASTAN365M",
        site="Mastan365",
        is_active=True,
        is_2fa_enabled=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Stand in for a launch: the platform quotes this token back to us.
    session = wallet.open_session(
        db, user, token=f"e2e-{uuid.uuid4().hex}", player_id=PLAYER,
        game_id=GAME_ID, game_name="Teenpatti One Day", currency="INR",
    )
    return user, session.player_session_token


def balance_of(db):
    db.expire_all()
    return db.query(User).filter(User.username == PLAYER).one().balance


def main():
    if not API_KEY:
        print("CASINO_OPERATOR_API_KEY is not set — the wallet endpoints decline "
              "everything by design. Set it to the running backend's key.")
        return 1

    http = httpx.Client(timeout=20.0)
    db = SessionLocal()
    user, token = setup(db)
    print(f"Player {PLAYER} created with balance {START_BALANCE:,.2f}")
    print(f"Wallet base URL: {WALLET}")

    try:
        # 1 --------------------------------------------------------------
        step("1. Api-Key is enforced")
        r = http.get(f"{WALLET}/accounts/balance/{PLAYER}", headers=headers(token, key=None))
        check("missing Api-Key is refused", r.status_code == 400, r.text[:120])
        check("code is INVALID_API_KEY", r.json().get("code") == "INVALID_API_KEY", r.text[:120])
        r = http.get(f"{WALLET}/accounts/balance/{PLAYER}", headers=headers(token, key="wrong-key"))
        check("wrong Api-Key is refused", r.json().get("code") == "INVALID_API_KEY", r.text[:120])

        # 2 --------------------------------------------------------------
        step("2. Get player balance")
        r = http.get(f"{WALLET}/accounts/balance/{PLAYER}", headers=headers(token))
        body = r.json()
        check("HTTP 200", r.status_code == 200, r.text[:160])
        check("balance is a decimal string", body.get("balance") == "10000.00", str(body))
        check("version is an int", isinstance(body.get("version"), int), str(body))
        first_version = body.get("version")

        # 3 --------------------------------------------------------------
        step("3. Balance works without a session token")
        r = http.get(f"{WALLET}/accounts/balance/{PLAYER}", headers=headers())
        check("answered with no Player-Session-ID", r.status_code == 200, r.text[:160])
        check("version moves forward", r.json().get("version") > first_version, r.text[:160])

        # 4 --------------------------------------------------------------
        step("4. Hold exposure for a round")
        payload = {
            "request_id": uid(), "player_id": PLAYER, "exposure": "-2000.00",
            "version": 5, "agent_id": 2, "round_id": ROUND_ID, "game_id": GAME_ID,
            "new_bets": [bet(795701435529433088, "2000.00", "2000.00")],
            "accepted_bets": [],
            "exposure_by_selections": {"winner.player_a": "1600.00", "winner.player_b": "-2000.00"},
        }
        r = http.post(f"{WALLET}/accounts/exposure", json=payload, headers=headers(token))
        check("HTTP 200", r.status_code == 200, r.text[:200])
        check("balance reports the hold subtracted", r.json().get("balance") == "8000.00", r.text[:200])
        check("the stored balance itself has not moved", balance_of(db) == 10000.0, str(balance_of(db)))
        held = db.query(CasinoRoundExposure).filter(
            CasinoRoundExposure.player_id == PLAYER, CasinoRoundExposure.round_id == ROUND_ID).one()
        check("hold stored as 2000.00 at version 5", held.exposure == 2000.0 and held.version == 5,
              f"{held.exposure} v{held.version}")

        # 5 --------------------------------------------------------------
        step("5. A stale exposure version is discarded")
        stale = dict(payload, request_id=uid(), exposure="-9000.00", version=4)
        r = http.post(f"{WALLET}/accounts/exposure", json=stale, headers=headers(token))
        check("HTTP 200", r.status_code == 200, r.text[:200])
        check("balance unchanged", r.json().get("balance") == "8000.00", r.text[:200])
        db.expire_all()
        held = db.query(CasinoRoundExposure).filter(
            CasinoRoundExposure.player_id == PLAYER, CasinoRoundExposure.round_id == ROUND_ID).one()
        check("hold and version untouched", held.exposure == 2000.0 and held.version == 5,
              f"{held.exposure} v{held.version}")

        # 6 --------------------------------------------------------------
        step("6. A newer version replaces the hold")
        newer = dict(payload, request_id=uid(), exposure="-3500.00", version=6,
                     new_bets=[bet(795701307884179456, "1500.00", "1500.00")],
                     accepted_bets=[bet(795701435529433088, "2000.00", "2000.00")])
        r = http.post(f"{WALLET}/accounts/exposure", json=newer, headers=headers(token))
        check("HTTP 200", r.status_code == 200, r.text[:200])
        check("balance now 6500.00", r.json().get("balance") == "6500.00", r.text[:200])
        check("both bets recorded",
              db.query(CasinoBet).filter(CasinoBet.player_id == PLAYER).count() == 2,
              str(db.query(CasinoBet).filter(CasinoBet.player_id == PLAYER).count()))

        # 7 --------------------------------------------------------------
        step("7. Exposure beyond the balance is declined")
        too_big = dict(payload, request_id=uid(), exposure="-50000.00", version=7)
        r = http.post(f"{WALLET}/accounts/exposure", json=too_big, headers=headers(token))
        check("HTTP 400", r.status_code == 400, r.text[:200])
        body = r.json()
        check("code is INSUFFICIENT_FUNDS", body.get("code") == "INSUFFICIENT_FUNDS", str(body))
        check("the error carries balance and version",
              body.get("balance") is not None and body.get("version") is not None, str(body))
        db.expire_all()
        held = db.query(CasinoRoundExposure).filter(
            CasinoRoundExposure.player_id == PLAYER, CasinoRoundExposure.round_id == ROUND_ID).one()
        check("the earlier hold survived the rejection", held.exposure == 3500.0, str(held.exposure))

        # 8 --------------------------------------------------------------
        step("8. An unknown session token is rejected")
        r = http.post(f"{WALLET}/accounts/exposure", json=dict(payload, request_id=uid(), version=8),
                      headers=headers("not-a-real-token"))
        check("HTTP 400", r.status_code == 400, r.text[:200])
        check("code is TOKEN_EXPIRED", r.json().get("code") == "TOKEN_EXPIRED", r.text[:200])

        # 9 --------------------------------------------------------------
        step("9. Settle the round (+1200.00)")
        settle_tx = uid()
        settlement = {
            "round_id": ROUND_ID, "game_id": GAME_ID,
            "settlements": [{
                "request_id": uid(), "transaction_id": settle_tx, "player_id": PLAYER,
                "exposure": "-3500.00", "pl": "1200.00", "agent_id": 2,
                "round_id": ROUND_ID, "game_id": GAME_ID, "player_session_token": token,
                "bets": [
                    bet(795701435529433088, "2000.00", "2000.00", pl="1600.00",
                        status="SETTLED", outcome="WON"),
                    bet(795701307884179456, "1500.00", "1500.00", pl="-400.00",
                        status="SETTLED", outcome="LOST"),
                ],
                "exposure_by_selections": {"winner.player_a": "1600.00"},
            }],
        }
        r = http.post(f"{WALLET}/accounts/settlement", json=settlement, headers=headers())
        check("HTTP 200", r.status_code == 200, r.text[:250])
        results = r.json().get("results", [])
        check("one result returned", len(results) == 1, str(r.json()))
        check("balance is 11200.00", results and results[0].get("balance") == "11200.00", str(results))
        check("stored balance moved to 11200.00", balance_of(db) == 11200.0, str(balance_of(db)))
        db.expire_all()
        held = db.query(CasinoRoundExposure).filter(
            CasinoRoundExposure.player_id == PLAYER, CasinoRoundExposure.round_id == ROUND_ID).one()
        check("hold released", held.is_open is False and held.exposure == 0.0,
              f"open={held.is_open} exp={held.exposure}")
        check("statement row written",
              db.query(AccountStatement).filter(
                  AccountStatement.username == PLAYER,
                  AccountStatement.event_type == "Casino").count() >= 1)

        # 10 -------------------------------------------------------------
        step("10. The same settlement replayed moves nothing")
        r = http.post(f"{WALLET}/accounts/settlement", json=settlement, headers=headers())
        check("HTTP 200", r.status_code == 200, r.text[:250])
        check("balance still 11200.00", balance_of(db) == 11200.0, str(balance_of(db)))
        check("only one settlement transaction stored",
              db.query(CasinoTransaction).filter(
                  CasinoTransaction.transaction_id == settle_tx).count() == 1)

        # 11 -------------------------------------------------------------
        step("11. Roll the settlement back and resettle (-1200.00, then +300.00)")
        rb_tx, re_tx = uid(), uid()
        rollback = {
            "round_id": ROUND_ID, "game_id": GAME_ID,
            "rollbacks": [{
                "request_id": uid(), "rollback_transaction_id": rb_tx, "transaction_id": re_tx,
                "player_id": PLAYER, "rollback_pl": "-1200.00", "pl": "300.00",
                "agent_id": 2, "round_id": ROUND_ID, "game_id": GAME_ID,
                "bets": [bet(795701435529433088, "2000.00", "2000.00", pl="300.00",
                             status="SETTLED", outcome="WON")],
            }],
        }
        r = http.post(f"{WALLET}/accounts/rollback", json=rollback, headers=headers())
        check("HTTP 200", r.status_code == 200, r.text[:250])
        check("balance is 10300.00 (11200 - 1200 + 300)", balance_of(db) == 10300.0, str(balance_of(db)))
        results = r.json().get("results", [])
        check("result reports 10300.00", results and results[0].get("balance") == "10300.00", str(results))

        # 12 -------------------------------------------------------------
        step("12. Rollback replayed moves nothing")
        r = http.post(f"{WALLET}/accounts/rollback", json=rollback, headers=headers())
        check("HTTP 200", r.status_code == 200, r.text[:250])
        check("balance still 10300.00", balance_of(db) == 10300.0, str(balance_of(db)))
        check("both legs stored once",
              db.query(CasinoTransaction).filter(
                  CasinoTransaction.transaction_id.in_([rb_tx, re_tx])).count() == 2)

        # 13 -------------------------------------------------------------
        step("13. Seamless debit / credit / rollback")
        debit_tx = uid()
        debit = {
            "request_id": uid(), "transaction_id": debit_tx, "transaction_type": "DEBIT",
            "amount": "500.00", "player_id": PLAYER, "version": 6, "agent_id": 2,
            "round_id": ROUND_ID + 1, "game_id": GAME_ID, "game_name": "Teenpatti One Day",
            "game_type": "Live",
            "new_bets": [bet(795701192930889728, "500.00", "500.00",
                             round_id=ROUND_ID + 1, transaction_id=debit_tx)],
            "accepted_bets": [],
        }
        r = http.post(f"{WALLET}/accounts/transactions/debit", json=debit, headers=headers(token))
        check("debit HTTP 200", r.status_code == 200, r.text[:200])
        check("balance 9800.00 after the stake left", r.json().get("balance") == "9800.00", r.text[:200])
        check("stored balance is 9800.00", balance_of(db) == 9800.0, str(balance_of(db)))

        r = http.post(f"{WALLET}/accounts/transactions/debit", json=debit, headers=headers(token))
        check("debit replay moves nothing", balance_of(db) == 9800.0, str(balance_of(db)))

        credit = {
            "request_id": uid(), "transaction_id": uid(), "sw_bet_transaction_id": debit_tx,
            "transaction_type": "CREDIT", "amount": "900.00", "player_id": PLAYER,
            "agent_id": 2, "round_id": ROUND_ID + 1, "game_id": GAME_ID,
            "bets": [bet(795701192930889728, "500.00", "500.00", pl="400.00",
                         round_id=ROUND_ID + 1, status="SETTLED", outcome="WON")],
        }
        r = http.post(f"{WALLET}/accounts/transactions/credit", json=credit, headers=headers(token))
        check("credit HTTP 200", r.status_code == 200, r.text[:200])
        check("balance 10700.00 after the payout", balance_of(db) == 10700.0, str(balance_of(db)))

        zero = dict(credit, request_id=uid(), transaction_id=uid(), amount="0.00")
        r = http.post(f"{WALLET}/accounts/transactions/credit", json=zero, headers=headers(token))
        check("a 0.00 credit is accepted", r.status_code == 200, r.text[:200])
        check("balance unchanged by it", balance_of(db) == 10700.0, str(balance_of(db)))

        debit2_tx = uid()
        debit2 = dict(debit, request_id=uid(), transaction_id=debit2_tx, amount="700.00")
        r = http.post(f"{WALLET}/accounts/transactions/debit", json=debit2, headers=headers(token))
        check("second debit accepted", r.status_code == 200, r.text[:200])
        check("balance 10000.00", balance_of(db) == 10000.0, str(balance_of(db)))

        rb = {
            "request_id": uid(), "transaction_id": uid(), "sw_bet_transaction_id": debit2_tx,
            "transaction_type": "CREDIT", "amount": "700.00", "player_id": PLAYER,
            "version": 7, "agent_id": 2, "round_id": ROUND_ID + 1, "game_id": GAME_ID,
            "game_name": "Teenpatti One Day", "game_type": "Live",
        }
        # No Player-Session-ID: a rollback can land after the session is gone
        r = http.post(f"{WALLET}/accounts/transactions/rollback", json=rb, headers=headers())
        check("rollback accepted with no session header", r.status_code == 200, r.text[:200])
        check("stake returned, balance 10700.00", balance_of(db) == 10700.0, str(balance_of(db)))

        # 14 -------------------------------------------------------------
        step("14. A blocked account is refused")
        db.expire_all()
        blocked = db.query(User).filter(User.username == PLAYER).one()
        blocked.is_active = False
        db.commit()
        r = http.get(f"{WALLET}/accounts/balance/{PLAYER}", headers=headers(token))
        check("HTTP 400", r.status_code == 400, r.text[:200])
        check("code is ACCOUNT_BLOCKED", r.json().get("code") == "ACCOUNT_BLOCKED", r.text[:200])
        blocked.is_active = True
        db.commit()

        # 15 -------------------------------------------------------------
        step("15. A malformed body is declined, not a 422")
        r = http.post(f"{WALLET}/accounts/exposure", json={"player_id": PLAYER}, headers=headers(token))
        check("HTTP 400, not 422", r.status_code == 400, f"got {r.status_code}: {r.text[:160]}")
        check("code is REQUEST_DECLINED", r.json().get("code") == "REQUEST_DECLINED", r.text[:200])

        r = http.get(f"{WALLET}/accounts/balance/NO_SUCH_PLAYER", headers=headers())
        check("an unknown player is REQUEST_DECLINED",
              r.status_code == 400 and r.json().get("code") == "REQUEST_DECLINED", r.text[:200])

    finally:
        print("\nCleaning up the test player…")
        cleanup(db)
        db.close()
        http.close()

    print("\n" + "=" * 72)
    print(f"  {passed} passed, {failed} failed")
    print("=" * 72)
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
