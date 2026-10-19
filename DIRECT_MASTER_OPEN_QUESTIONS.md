# Direct Master Module — Open Questions for Client
**Project:** Rolex Admin Panel → Direct Master Management
**Date:** October 19, 2026
**Status:** Module built with assumptions — confirmation pending

---

## 1. Kya ban chuka hai (What is already built)

Client ke screenshot ke hisaab se poora module bana diya gaya hai:

| Layer | File | Kya hai |
|:---|:---|:---|
| DB | `backend/app/models/direct_master.py` | `parties`, `direct_masters`, `direct_master_third_parties` tables |
| API | `backend/app/api/v1/endpoints/direct_masters.py` | Party CRUD + Direct Master CRUD + filters |
| UI | `frontend/src/views/rolex/pages/DirectMasterView.tsx` | Form (screenshot jaisa) + list table + edit/delete |
| Menu | `/direct-master` | Sidebar me "Direct Master" |

Exchange dropdown existing portal list (`MASTAN365`, `MASTAN99`, `MASTAN247`, `MASTANREDDY`) se bharta hai.
Party dropdowns ke liye "Add Party" button se nayi party add ho sakti hai.

---

## 2. Jo assumptions lagayi hain (⚠️ confirm karwana hai)

Ye 5 cheezein screenshot se clear nahi thi. Abhi inka logical default laga diya hai —
client ka jawab aane ke baad sirf ek-ek line badalni padegi.

### Q1. Purchase Rate aur Seller Rate ka direction
Screenshot me Purchase `0.0250` aur Seller `0.0200` hai.

- **Humne maana:** Purchase Party humse `0.0250` par leti hai, Seller Party ko `0.0200` par milta hai,
  beech ka **`0.0050` spread humara profit** hai.
- **Poochna hai:** Kya ye sahi hai, ya ulta — hum `0.0250` par kharidte hain aur `0.0200` par bechte hain
  (yaani loss)?
- **Kahan badlega:** `_derive()` in `backend/app/api/v1/endpoints/direct_masters.py`

### Q2. Third Party commission kis par lagta hai?
- **Humne maana:** Commission **spread par** lagta hai.
  Example: spread `0.0050`, commission `10%` → net `0.0045`.
- **Poochna hai:** Commission spread par hai, total volume/points par hai, ya purchase amount par?
- **Kahan badlega:** wahi `_derive()` function

### Q3. Party list alag hai ya common?
- **Humne maana:** Ek hi **Party master** hai. Har party ko "Usable As" set kar sakte hain —
  Purchase only / Seller only / Third only / All. "All" wali party teeno dropdown me dikhti hai.
- **Poochna hai:** Kya Purchase, Seller aur Third ki **alag-alag** lists honi chahiye,
  ya ek hi party teeno role me aa sakti hai?

### Q4. "Credit" field ka matlab?
- **Humne maana:** Rupees me credit limit hai, aur **optional** hai
  (screenshot me iske saath `*` nahi tha, baaki sab par tha).
- **Poochna hai:** Credit rupees me hai ya points/coins me? Required hona chahiye ya nahi?

### Q5. Record save hone par ledger entry banegi?
- **Humne maana:** **Nahi.** Ye abhi sirf ek master/reference record hai.
  A/C Statement me koi automatic entry nahi jaati.
- **Poochna hai:** Kya Direct Master add karne par automatic `AccountStatement` entry
  (debit/credit) banni chahiye?

---

## 3. Chhote points (optional — inke bina kaam chalega)

6. **Multiple purchase/seller parties:** Abhi ek record me ek purchase aur ek seller party hai
   (sirf Third Party repeatable hai, jaisa screenshot me `+` button tha). Kya purchase/seller bhi
   multiple ho sakte hain?
7. **Edit/Delete:** Screenshot me form ke neeche ka table cut gaya tha. Humne Edit + Delete +
   Active/Inactive toggle de diya hai. Confirm kar lein ki aur koi column chahiye.
8. **History:** Rate change hone par purana rate history me rakhna hai, ya record overwrite ho jaye?
9. **Permissions:** Ye screen sirf Super Admin dekh paye, ya Operator bhi?
10. **Duplicate check:** Ek hi Exchange + Admin ka dobara record ban sakta hai ya block karna hai?

---

## 4. Client ko bhejne ke liye ready message

```text
Hi,

Direct Master Management screen ka development ho gaya hai. Launch se pehle
5 business rules confirm karne hain:

1. RATES: Purchase Rate 0.0250 aur Seller Rate 0.0200 me se humara profit kaun sa hai?
   Humne maana hai ki beech ka 0.0050 spread hamara margin hai. Sahi hai?

2. COMMISSION: Third Party ka commission % kis amount par lagega —
   spread par, total volume par, ya purchase amount par?

3. PARTY LIST: Purchase Party, Seller Party aur Third Party ki alag-alag lists chahiye,
   ya ek hi party teeno jagah use ho sakti hai?

4. CREDIT: Credit field rupees me hai ya points me? Ye compulsory hona chahiye?

5. LEDGER: Record add karne par A/C Statement me automatic entry banni chahiye,
   ya ye sirf ek master record hai?

In jawabon ke baad calculation final kar denge. Baaki screen ready hai.

Thanks
```
