# Betting Exchange API Integration — Requirements
**Project:** Rolex Admin Panel ⟷ Mastan365 Exchange
**Date:** October 19, 2026
**Status:** Pending Client Input
**Reference:** Mastan365 master/agent panel (Home screen screenshot)

---

## 1. Context

Rolex Admin Panel ko Mastan365 exchange se connect karna hai. Niche di gayi list
**Mastan365 ke actual panel screen ke har element ko dekh kar** banayi gayi hai —
har row me likha hai ki screen par kya dikhta hai aur uske liye kaunsi API chahiye.

Screen jo reference li gayi hai: **master/agent panel ka Home page** (player site nahi) —
isme top bar par `Bal / Upline`, aur menu me `Market`, `Client List`, `Create User` hai.

---

## 2. Screen → API Mapping (सबसे ज़रूरी हिस्सा)

### 2.1 Left Sidebar — Sports list + green count badges
> Screen par: `IN-PLAY 38`, `CRICKET 75`, `FOOTBALL 96`, `TENNIS 132`, `HORSE RACING 0`,
> `GREYHOUND RACING 0`, `POLITICS 0`, `INT CASINO 0`, `KABADDI 0`, `SPORTS BOOK 0`,
> `BINARY 2`, `GENIUS 0`

| # | Chahiye | Detail |
|:--|:--|:--|
| A1 | **Sports List API** | `sport_id`, `sport_name`, display order |
| A2 | **Event count per sport** | Green badge ka number (38/75/96/132). Ye alag API hai ya A1 ke response me hi aata hai? |
| A3 | **Sport ID mapping** | Kya Betfair standard IDs use hote hain (4=Cricket, 1=Football, 2=Tennis, 7=Horse Racing) ya apne custom IDs? |
| A4 | **IN-PLAY count** | Alag se, ya `inplay=true` filter se? |

### 2.2 Event List Table (main area)
> Screen par: `Karnataka v Saurashtra (18/10/2026 09:30:00 AM)`, uske niche `(Others)` /
> `(Test Matches)` / `(Pakistan / Presidents Trophy)` / `(Simulated Reality League / Super Smash SRL)`

| # | Chahiye | Detail |
|:--|:--|:--|
| B1 | **Event / Fixture List API** | `event_id`, `event_name`, `open_date` (start time), `inplay` flag |
| B2 | **Competition / Series name** | Bracket wala text — `(Pakistan / Presidents Trophy)`. Alag field hai ya event name me hi? |
| B3 | **Timezone** | `18/10/2026 09:30:00 AM` kis timezone me hai — IST ya UTC? |
| B4 | **Sorting / pagination** | List kis order me aati hai, aur page limit kya hai? |

### 2.3 Badges — F / B / P / TV icon
> Har event ke niche chhote badge: green `F`, green `B`, red `P`, blue TV/monitor icon,
> aur ek grey circle

| # | Chahiye | Detail |
|:--|:--|:--|
| C1 | **Badge ka matlab confirm karo** | Humara andaaza: `F` = Fancy, `B` = Bookmaker, `P` = Premium/Sportsbook. **Confirm karwana hai.** |
| C2 | **Grey circle kya hai?** | Screen par dikhta hai par matlab clear nahi |
| C3 | **Response me ye flags kaise aate hain** | Field names chahiye, jaise `has_fancy`, `has_bookmaker`, `has_premium`, `has_tv` |

### 2.4 Odds Boxes — 6 blue/pink boxes (SABSE IMPORTANT)
> Screen par `South Africa v Australia` row me: `5.3 / 3.07`, `6.2 / 70.77`, `2.28 / 1.42`,
> `2.38 / 2.62`, `2.54 / 42.31`, `2.56 / 160.57`
> Baaki rows me `-` dikhta hai.

| # | Chahiye | Detail |
|:--|:--|:--|
| D1 | **Match Odds API** | `market_id`, `market_name`, runners ki list (Team1 / Draw / Team2) |
| D2 | **Back / Lay price + size** | Upar wala number = price, niche wala = available size. Confirm karo. |
| D3 | **Runner order** | 6 boxes = 3 runners × (back, lay)? Order kya hai — Team1 back, Team1 lay, Draw back, Draw lay, Team2 back, Team2 lay? |
| D4 | **Price depth** | Sirf best price milta hai ya 3 levels deep available hai? |
| D5 | **⚠️ REST ya WebSocket?** | **Ye sabse zaroori sawaal hai.** Agar REST polling hai → recommended interval kya hai (500ms? 1s?) aur rate limit kya hai. Agar WebSocket hai → `wss://` URL + subscribe/unsubscribe message ka format. |
| D6 | **Market status enum** | `-` kab dikhta hai — SUSPENDED, CLOSED, ya market hi nahi hai? Poori status list chahiye. |

### 2.5 Bookmaker / Fancy / Premium markets
> `B`, `F`, `P` badge wale events ke andar ke markets

| # | Chahiye | Detail |
|:--|:--|:--|
| E1 | **Bookmaker Odds API** | Back/lay rate (points me), market status |
| E2 | **Fancy / Session API** | Cricket session markets — runs, wickets, player runs. `yes` / `no` rate + size |
| E3 | **Premium / Sportsbook API** | `P` badge wale markets |
| E4 | **Min / Max bet limits** | Har market type ke alag limits hote hain — response me aate hain ya alag API hai? |

### 2.6 Top Bar — Balance
> Screen par: `Bal : 201600` aur `Upline : -718`

| # | Chahiye | Detail |
|:--|:--|:--|
| F1 | **Agent Balance API** | `balance`, `available_balance`, `exposure`, `credit_limit` |
| F2 | **`Upline` ka matlab?** | `-718` negative hai — ye upline ke saath ka P&L hai, ya pending settlement? **Field ki exact definition chahiye.** |
| F3 | **Refresh method** | Polling karna padega ya socket se push aata hai? |

### 2.7 Event ke niche red "0"
> Har event row ke left me red rang me `0` dikhta hai

| # | Chahiye | Detail |
|:--|:--|:--|
| G1 | **Exposure / Liability API** | Ye us event par current exposure hai? Per-event liability kaise milegi? |

### 2.8 Top Menu — Market / Client List / Create User
| # | Chahiye | Detail |
|:--|:--|:--|
| H1 | **Market menu** | Iske andar kya hai — Market Analysis, Live Bets, Bet List? Screenshot bhejne ko bolo |
| H2 | **Live / Matched Bets API** | Per-market matched aur unmatched bets, aur runner-wise exposure |
| H3 | **Client List API** | Downline clients — username, balance, exposure, status |
| H4 | **Create User API** | Username, password, credit, commission/partnership % |
| H5 | **Username availability check** | Create se pehle check hota hai? |
| H6 | **Client actions** | Lock/unlock, betting suspend, change password, credit update |

### 2.9 Live TV (blue monitor icon)
| # | Chahiye | Detail |
|:--|:--|:--|
| I1 | **Stream API** | Stream URL / iframe URL, aur usko authenticate kaise karna hai (token? channel id?) |
| I2 | **Scorecard** | Live score widget ka URL ya API |

### 2.10 News ticker
> Screen par scroll hota hua: `CRICKET FANTASY11 IS NOW AVAILABLE IN OUR EXCHANGE...`

| # | Chahiye | Detail |
|:--|:--|:--|
| J1 | **Announcement / News API** | Marquee ka text kahan se aata hai |

### 2.11 Wallet operations (panel me nahi dikha, par humein chahiye)
| # | Chahiye | Detail |
|:--|:--|:--|
| K1 | **Chip Deposit (Credit) API** | Deposit approve hone par client wallet me chips daalna |
| K2 | **Chip Withdrawal (Debit) API** | Withdrawal par balance debit karna |
| K3 | **Client Statement / Ledger API** | Date range ke saath |
| K4 | **Bet History API** | Settled bets, P&L, commission |
| K5 | **Settlement webhook** | Match result declare hone par notification |

---

## 3. Access & Technical Requirements

| # | Requirement | Detail |
|:--|:--|:--|
| L1 | **API Documentation** | Swagger link ya Postman collection |
| L2 | **Base URLs** | Staging/UAT **aur** Production, dono |
| L3 | **Authentication** | API Key + Secret, ya username/password/TOTP? Login API ka response format |
| L4 | **Token lifetime** | Access token kitni der valid rehta hai, refresh API hai? |
| L5 | **IP Whitelisting** | Humara server IP kahan share karna hai |
| L6 | **Rate limits** | Per endpoint kitni requests allowed hain |
| L7 | **Sandbox / test account** | Testing ke liye dummy master account |
| L8 | **Currency / unit** | `201600` rupees hai ya points/chips? |

---

## 4. ⚠️ 5 Sawaal jinke bina kaam shuru nahi ho sakta

1. **Odds feed REST hai ya WebSocket?** (D5) — pura architecture isi par depend karta hai
2. **Swagger / Postman collection milega?** (L1) — iske bina har field guess karna padega
3. **Sandbox account milega?** (L7) — live account par test nahi kar sakte
4. **`Upline` field ka exact matlab?** (F2)
5. **Sport IDs Betfair standard hain ya custom?** (A3)

---

## 5. Client ko bhejne ke liye ready message

```text
Hi Team,

Hum Rolex Admin Panel ko Mastan365 exchange se integrate kar rahe hain.
Aapke master panel ka Home screen dekh kar niche ki API list banayi hai.

== SABSE ZAROORI (inke bina start nahi kar sakte) ==
1. Swagger link ya Postman collection
2. Staging/UAT + Production base URLs
3. Sandbox/test master account
4. API Key + Secret (ya login API ka format), aur token refresh ka tarika
5. IP whitelisting ka process — humara server IP kahan bhejein?

== ODDS FEED (sabse important technical sawaal) ==
6. Live odds REST polling se milte hain ya WebSocket se?
   - REST hai to: recommended poll interval aur rate limit kya hai?
   - WebSocket hai to: wss:// URL aur subscribe message ka format
7. Match Odds response me back/lay price ke saath available size bhi aata hai?
   Price depth 1 level hai ya 3?
8. Market status ki poori list (OPEN / SUSPENDED / CLOSED / BALLSTART etc.)

== SPORTS & EVENTS ==
9. Sports list API — sport_id, name, aur har sport ka event count
   (aapke panel me CRICKET 75, FOOTBALL 96, TENNIS 132 jaise badge dikhte hain)
10. Sport IDs Betfair standard hain (4=Cricket, 1=Football, 2=Tennis) ya custom?
11. Event list API — event_id, event name, series/competition name, start time
12. Event timestamps kis timezone me hain — IST ya UTC?
13. Event ke saath F / B / P badge aate hain — ye flags response me kaunse field me hain,
    aur inka exact matlab kya hai? (humara andaaza: Fancy / Bookmaker / Premium)

== MARKETS ==
14. Match Odds API
15. Bookmaker odds API
16. Fancy / Session API (cricket runs, wickets, player runs)
17. Premium / Sportsbook markets API
18. Har market type ke min/max bet limits

== BALANCE & EXPOSURE ==
19. Agent balance API — balance, available balance, exposure, credit limit
20. Aapke panel me "Upline : -718" dikhta hai — is field ka exact matlab kya hai?
21. Per-event exposure/liability kaise milegi?
    (event list me red colour me number dikhta hai)
22. Balance polling se refresh karna hai ya socket se push aata hai?

== CLIENT MANAGEMENT ==
23. Client list API — username, balance, exposure, status
24. Create user API — username, password, credit, commission/partnership %
25. Username availability check API
26. Client lock/unlock, betting suspend, change password, credit update
27. Client statement/ledger API (date range ke saath)

== WALLET ==
28. Chip deposit (credit) API
29. Chip withdrawal (debit) API
30. Bet history API — settled bets, P&L, commission
31. Market settlement ka webhook ya notification

== EXTRA ==
32. Live TV stream URL aur usko authenticate karne ka tarika
33. Live scorecard API/widget
34. Balance/amount rupees me hai ya points/chips me?

Sabse pehle sirf Swagger/Postman + sandbox account bhej dijiye,
hum turant integration testing shuru kar denge.

Thanks
```

---

## 6. Humara next step (API aane ke baad)

1. `backend/app/services/exchange_client.py` me endpoints implement karna
2. Odds ke liye WebSocket connection ya background polling worker set karna
3. Rolex frontend me In-Play sports tabs ko live feed se jodna
4. Chip deposit/withdraw ko existing Deposit/Withdraw module se connect karna
