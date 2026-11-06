# Live Casino integration

Implements the client's *Live Casino Operator API — Exposure & Seamless Wallets* (v1.1.0).

We are the **Operator**. The client's live casino provider is the **Platform**.
The integration runs in both directions:

| Direction | Who calls | What |
|---|---|---|
| **Inbound** | us → platform | `/auth/token`, `/games`, `/launch-url` |
| **Outbound** | platform → us | balance, exposure, settlement, rollback, seamless debit/credit/rollback |

Both wallet models in the spec are implemented. **Exposure** is the default
because it is how our own sports book already works: nothing leaves the
balance while a round is live, the worst case is held back, and the balance
moves once on settlement.

---

## 1. What to send the platform

Give the platform these three things:

| Item | Value |
|---|---|
| Operator base URL | `https://<your-domain>/casino/operator` |
| `Api-Key` | the value you set as `CASINO_OPERATOR_API_KEY` |
| Wallet model | `exposure` (or `seamless`, if that is what you agreed) |

They will call `<base URL>/accounts/...` — exactly the paths in their spec.
Also send them your **production server IP addresses**; the spec requires it
before they open their Operator API to you.

Generate the API key with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 2. What to get from the platform

Put these in `backend/.env` (all are documented in `.env.example`):

```
CASINO_PROVIDER=live
CASINO_API_URL=https://<their-host>/api/operator/e_w/v1
CASINO_API_USERNAME=<username they issue>
CASINO_API_PASSWORD=<password they issue>
CASINO_OPERATOR_API_KEY=<the key you generated above>
CASINO_WALLET_MODEL=exposure
CASINO_RETURN_URL=https://<your-domain>/casino
CASINO_ALLOWED_IPS=<their source IPs, comma separated — optional but recommended>
```

Leave `CASINO_PROVIDER=mock` (the default) and the player site keeps serving
the built-in demo table list, so nothing breaks before the credentials arrive.

---

## 3. Endpoints we expose to the platform

All mounted under `CASINO_WALLET_BASE_PATH` (default `/casino/operator`),
outside `/api/v1`.

| Method | Path | Wallet | Notes |
|---|---|---|---|
| `GET` | `/accounts/balance/{player_id}` | both | answers with a missing or expired session token |
| `POST` | `/accounts/exposure` | exposure | all `new_bets` accepted or none |
| `POST` | `/accounts/settlement` | exposure | batched per round |
| `POST` | `/accounts/rollback` | exposure | rollback + resettlement, two idempotency keys |
| `POST` | `/accounts/transactions/debit` | seamless | |
| `POST` | `/accounts/transactions/credit` | seamless | `amount` may be `0.00` |
| `POST` | `/accounts/transactions/rollback` | seamless | processed without a session token |

**Rules we honour**

- `Api-Key` is required on every call. Wrong or missing → `INVALID_API_KEY`.
  With no key configured the endpoints decline everything, by design — a
  half-configured deployment can never move money.
- Everything we decline returns **HTTP 400** with `{code, message}` and, where
  we know them, `balance` and `version`. Codes used: `REQUEST_DECLINED`,
  `TOKEN_EXPIRED`, `INSUFFICIENT_FUNDS`, `ACCOUNT_BLOCKED`, `INVALID_API_KEY`,
  `UNKNOWN_ERROR`.
- A malformed body is a `400 REQUEST_DECLINED`, never a 422.
- `version` is unix milliseconds and never repeats, so balance updates always
  order correctly.
- Amounts go out as decimal strings (`"150.00"`).
- `balance` already has exposure subtracted, as the spec requires.
- **Idempotency**: every applied movement is stored against the platform's
  `transaction_id`. A replay returns the current balance and moves nothing.
  Rollback/resettlement dedupes `rollback_transaction_id` and
  `transaction_id` separately.
- Settlement applies even if the balance goes negative.
- Only genuinely unexpected failures return `UNKNOWN_ERROR` or 500, which are
  the two things the platform retries.

## 4. How it lands in our data

| Table | Holds |
|---|---|
| `casino_sessions` | `player_session_token` → our client, created at launch |
| `casino_round_exposures` | exposure held per player per round, with the platform's version |
| `casino_transactions` | every applied movement, unique on `transaction_id` |
| `casino_bets` | the bets the platform reports, for the casino report and audit |

`player_id` on the platform **is our username** — we send it at launch, so the
two can never drift.

Casino holds are part of `user_exposure()`, so they already reduce what a
player can stake on sports, withdraw, or have transferred by their master, and
they show in the player site header and the panel's client rows.

Every movement also writes an `account_statements` row tagged
`event_type = "Casino"`, so casino P/L appears in the player's A/C statement
alongside sports.

## 5. Checking it

With the backend running and `CASINO_OPERATOR_API_KEY` set:

```bash
CASINO_OPERATOR_API_KEY=<key> ./venv/bin/python test_casino_wallet_e2e.py
```

56 checks covering the whole contract: key enforcement, balance, exposure
holds, stale versions, insufficient funds, expired tokens, settlement,
rollback/resettlement, seamless debit/credit/rollback, blocked accounts,
idempotent replays and malformed bodies. It creates a throwaway client and
removes it afterwards.

Integration state at a glance (never shows the secrets):

```
GET /api/v1/player/casino/status
```
