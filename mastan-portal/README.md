# Mastan Master Panel

The Mastan365-style master/agent panel (Home with live odds, match page with
Fancy/Bookmaker, Down-Line, Create User, A/C Statement). It runs on its own
port and talks to the Rolex backend under `/api/v1/exchange`.

## Run locally

1. Start the Rolex backend as usual (`cd backend && python run.py`, port 8001).
2. Start the panel:

   ```bash
   npm --prefix mastan-portal install
   npm --prefix mastan-portal run dev
   ```

3. Open **http://mastan365.localhost:5174**. No domain purchase or hosts-file
   entry is needed: any `*.localhost` name points to this machine. The part
   before `.localhost` picks the domain portal from Rolex Admin, so
   `mastan99.localhost:5174`, `mastan247.localhost:5174` and
   `mastanreddy.localhost:5174` work too. Plain `localhost:5174` uses
   `VITE_DEFAULT_PORTAL` (see `.env.example`).

## Login

On the first login to a domain the backend creates that domain's top (Admin)
account. Its username is the master name from the portal title in Rolex
(e.g. `MASTAN365M` for mastan365, `MASTAN99M` for mastan99) and its password is
`EXCHANGE_DEMO_PASSWORD` in `backend/app/core/config.py` (local testing only).
Change it from **Change Password** after logging in.

Hierarchy: Admin → Super Master → Master → Client. Each level creates the next
from **Create User** and gives chips with **D / W** on **Down-Line**.

## What is real and what is mock

| Part | Source today |
|:--|:--|
| Bal / Upline (Admin) | Rolex `domain_portals` balance / P&L for the domain |
| Clients | Rolex `users` of that domain: a deposit approved in Rolex shows here, and panel D/W on a client is written to the Rolex A/C statement |
| Super Masters / Masters | `exchange_accounts` table (separate from Rolex staff logins) |
| Sports, fixtures, odds, scores, fancy | **Mock feed**, `backend/app/services/exchange/mock_feed.py` |
| Bets, reports (Sport Report, Weekly, etc.) | Empty until the Mastan API arrives |

## When the Mastan API arrives

- Market data: add a feed next to `mock_feed.py` that implements `MarketFeed`
  (`backend/app/services/exchange/feed.py` documents the shapes) and set
  `EXCHANGE_PROVIDER` to it. The panel frontend does not change.
- Accounts and chips: `backend/app/api/v1/endpoints/exchange_downline.py` is
  where create user / D-W / lock should also call the Mastan API.

## Logo

The crown mark is a placeholder. Replace it in `src/components/Logo.tsx` and
`public/favicon.svg` once the client sends their logo.
