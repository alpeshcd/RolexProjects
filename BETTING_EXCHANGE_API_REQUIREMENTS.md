# Betting Exchange API Integration Requirements Document
**Project:** Rolex Admin Panel ⟷ Mastan365 / Betting Exchange Integration  
**Date:** October 17, 2026  
**Status:** Requirements Gathering / Pending Client Input  

---

## 1. Executive Summary (उद्देश्य)
Humare **Rolex Admin Panel** ko **Mastan365 (admin.mastan365.com)** exchange ke sath real-time live betting data, live odds, client balance, chip deposit/withdrawal, aur user management ke liye connect karna hai. 

Is integration ke liye client / exchange provider se niche di gayi APIs aur technical details ki zaroorat hai.

---

## 2. Credentials & Access Details (क्लाइंट से जो क्रेडेंशियल्स चाहिए)

| S.No. | Requirement | Description | Status |
|:---|:---|:---|:---|
| 1 | **API Base URL** | Staging/UAT aur Production API URLs (e.g. `https://api.mastan365.com/v1`) | Pending |
| 2 | **API Authentication Keys** | `API_KEY`, `CLIENT_SECRET`, ya `Bearer Token` | Pending |
| 3 | **Agent/Master Account** | Master Agent Login Credentials (agar session-based authentication ho) | Pending |
| 4 | **Postman Collection / Swagger** | API endpoints ka official documentation ya JSON collection | Pending |
| 5 | **IP Whitelisting Access** | Production server IP allow-list karne ki process | Pending |
| 6 | **WebSocket Feed URL** | Real-time live odds feed URL (e.g., `wss://odds.mastan365.com/live`) | Pending |

---

## 3. Required API Endpoints List (ज़रूरी APIs की लिस्ट)

### Module 1: Authentication & Security (लॉगिन और टोकन)
* **1.1. Agent / Partner Auth API:**
  * **Purpose:** Admin panel ko exchange server par authenticate karna.
  * **Payload:** `api_key` & `secret` (ya `username`, `password`, `totp`).
  * **Response:** `access_token`, `refresh_token`, `expires_in`.
* **1.2. Token Refresh API:**
  * **Purpose:** Token expire hone par automatic re-authentication.

---

### Module 2: Live Sports & Market Odds Feed (मैच और ऑड्स)
Screenshot me dikh rahe sports (Cricket, Football, Tennis, Horse Racing, etc.) aur Blue (Back) / Pink (Lay) odds ke liye:

* **2.1. Active Sports & In-Play Fixtures API:**
  * **Endpoint Example:** `GET /api/sports/active-events` ya `GET /api/inplay`
  * **Purpose:** Live aur upcoming matches ki list fetch karna (Event ID, Match Name, Start Time, Sport Type jaise Cricket, Football).
* **2.2. Live Match Odds API (Back & Lay Odds):**
  * **Endpoint Example:** `GET /api/markets/{event_id}/odds` ya WebSocket Stream
  * **Purpose:** Match Odds (Team 1 / Draw / Team 2) ke Back (Blue) aur Lay (Pink) rate aur volume live update karna.
* **2.3. Bookmaker & Fancy Markets API:**
  * **Endpoint Example:** `GET /api/markets/{event_id}/fancy`
  * **Purpose:** Cricket Session/Fancy (Runs, Wickets, Player runs) aur Bookmaker odds stream karna.

---

### Module 3: Master & Client Balance Management (वॉलेट और चिप्स)
Screenshot ke top bar me jo `Bal: 143418` aur `Upline: 24006` dikh raha hai:

* **3.1. Master/Agent Balance API:**
  * **Endpoint Example:** `GET /api/agent/balance`
  * **Purpose:** Master Agent ka current balance, Upline share, credit limit, aur current exposure sync karna.
* **3.2. Client Balance Sync API:**
  * **Endpoint Example:** `GET /api/clients/{username}/balance`
  * **Purpose:** Kisi specific player/client ka live wallet balance aur available balance check karna.
* **3.3. Chip Deposit (Credit) API:**
  * **Endpoint Example:** `POST /api/chips/deposit`
  * **Purpose:** Jab admin panel me UTR/Deposit approve ho, to client ke exchange wallet me chips/points credit karna.
* **3.4. Chip Withdrawal (Debit) API:**
  * **Endpoint Example:** `POST /api/chips/withdraw`
  * **Purpose:** Jab client withdrawal request kare, to exchange wallet se balance debit karna.

---

### Module 4: Client & User Management (यूजर मैनेजमेंट)
* **4.1. Create User API:**
  * **Endpoint Example:** `POST /api/clients/create`
  * **Purpose:** Rolex Admin se naya client account banana (Username, Password, Mobile, Credit Limit).
* **4.2. Client List & Status API:**
  * **Endpoint Example:** `GET /api/clients/list`
  * **Purpose:** All downline clients ki list, active/suspended status, and exposure fetch karna.
* **4.3. User Status & Exposure Update API:**
  * **Endpoint Example:** `POST /api/clients/{id}/status`
  * **Purpose:** Client ko Lock/Unlock, Active/Inactive ya betting suspend karna.
* **4.4. Change Client Password API:**
  * **Endpoint Example:** `POST /api/clients/{id}/change-password`

---

### Module 5: Bets, Exposure & Settlements (बेट हिस्ट्री और रिजल्ट)
* **5.1. Open / Live Bets API:**
  * **Endpoint Example:** `GET /api/bets/active`
  * **Purpose:** Currently chal rahi live bets, matched bets, and total market exposure dekhna.
* **5.2. Bet History API:**
  * **Endpoint Example:** `GET /api/bets/history?date_from=...&date_to=...`
  * **Purpose:** P&L (Profit/Loss), settled bets aur commission calculate karna.
* **5.3. Market Result Webhook / Settlement API:**
  * **Purpose:** Match khatam hone par winner declaration aur market settlement ka automated notification.

---

## 4. Ready-to-Send Client Message (क्लाइंट को भेजने के लिए रेडी मैसेज)

Yeh message aap direct copy karke client ya unke exchange provider / tech team ko WhatsApp/Telegram/Email par bhej sakte hain:

```text
Hi Team,

We are integrating our Rolex Admin Panel with the Mastan365 betting exchange platform for real-time sports odds, user management, and wallet settlement.

Could you please provide the following API details and documentation?

1. API Documentation:
   - Swagger link / Postman collection for the White-label Agent/Master API.

2. Access & Authentication:
   - Staging/UAT and Production Base URLs
   - API Key & Secret (or Master Agent API credentials)
   - IP Whitelisting requirements (let us know where to share our server IP)

3. Required Endpoints:
   - Live Sports & In-Play Fixtures (Cricket, Football, Tennis, etc.)
   - Real-time Market Odds (Back / Lay and Fancy/Bookmaker feed via REST/WebSocket)
   - Master & Upline Balance sync API
   - Client Management (Create Client, Client List, Status/Password update)
   - Chip Transfer API (Deposit / Credit & Withdrawal / Debit)
   - Bet History, Open Bets & Market Settlement / Result Webhook

Please let us know if there is a sandbox/test environment available so we can start the integration testing immediately.

Thank you!
```

---

## 5. Next Technical Steps (हमारे लिए अगला कदम)
1. Client se Postman Collection / Swagger aane par endpoints ko `backend/app/services/exchange_client.py` me implement karna.
2. Background worker ya WebSocket connection set karna real-time odds update ke liye.
3. Rolex frontend me live In-Play sports tabs ko direct exchange live feed se link karna.
