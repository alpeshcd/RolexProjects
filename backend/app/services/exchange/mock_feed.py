"""Generated fixtures, odds and scores standing in for the Mastan exchange API.

Fixtures are a fixed list whose start times are laid out from the start of the
current 6-hour block, so something is always in play. Prices, scores and fancy
lines are pure functions of the event and the clock: every poll moves a little,
like a live feed, with no state to keep.
"""
import math
import random
import time
from datetime import datetime, timezone
from typing import Optional

from app.services.exchange.feed import MarketFeed

BLOCK_SECONDS = 6 * 3600
EVENT_ID_BASE = 33_500_000

SPORTS = [
    (4, "Cricket"),
    (1, "Football"),
    (2, "Tennis"),
    (7, "Horse Racing"),
    (4339, "Greyhound Racing"),
    (2378961, "Politics"),
    (99998, "Int Casino"),
    (99994, "Kabaddi"),
    (99990, "Sports Book"),
    (99991, "Binary"),
    (99992, "Genius"),
    (7522, "Basketball"),
    (7511, "Baseball"),
]
SPORT_NAMES = dict(SPORTS)

# Hours of play, whether the draw is a runner, overs per innings (cricket)
FORMATS = {
    "test": {"hours": 96, "draw": True, "overs": 150},
    "odi": {"hours": 8, "draw": False, "overs": 50},
    "t20": {"hours": 3.5, "draw": False, "overs": 20},
    "t10": {"hours": 1.5, "draw": False, "overs": 10},
    "football": {"hours": 2, "draw": True},
    "tennis": {"hours": 3, "draw": False},
    "basketball": {"hours": 2.5, "draw": False},
    "baseball": {"hours": 3.5, "draw": False},
    "kabaddi": {"hours": 1, "draw": False},
}
CRICKET_FORMATS = {"test", "odi", "t20", "t10"}

# (sport_id, home, away, competition, format, start in hours from the block start, flags)
# Flags: O = match odds open, F = fancy, B = bookmaker, P = premium, T = live TV
FIXTURES = [
    # ---- Matches from Mastan99 / bet.mastanx.com ----
    (4, "Baroda", "Jammu And Kashmir", "Ranji Trophy", "test", -0.9, "PT"),
    (4, "State Bank", "Markhor It Solutions", "Others", "t20", -0.7, "P"),
    (4, "South Africa", "Australia", "Test Matches", "test", -0.5, "OFBT"),
    (4, "South Australia", "Western Australia", "Others", "t20", -0.4, "OFBPT"),
    (4, "Bangladesh", "West Indies", "T20 Internationals", "t20", -0.3, "OFBT"),
    (4, "Kuwait", "Kenya", "One Day Internationals", "odi", -0.2, "OFBT"),
    (4, "Qatar", "Denmark", "One Day Internationals", "odi", -0.2, "OFBT"),
    (4, "India W", "Zimbabwe W", "Womens One Day Internationals", "odi", -0.1, "OFBT"),
    (4, "Trinbago Knight Riders SRL", "Guyana Amazon Warriors SRL", "Simulated Reality League / Caribbean Premier League SRL", "t20", 0.1, "OFBT"),
    (4, "Pakistan SRL", "England SRL", "Simulated Reality League / T20 International SRL", "t20", 0.2, "OFBT"),
    (4, "PAKISTAN T10", "WEST INDIES T10", "Others", "t10", 0.3, "FBT"),
    (4, "AXIOM", "D-VON DUDLEY", "Others", "t10", 0.4, "FBT"),
    (4, "SAN FRANCISCO UNICORNS SO", "LOS ANGELES KNIGHT RIDERS SO", "Others", "t10", 0.4, "FBT"),
    (4, "VICTORIA T10", "WESTERN AUSTRALIA T10", "Others", "t10", 0.5, "FBT"),
    (4, "ALEXA BLISS", "BRIE BELLA", "Others", "t10", 0.5, "FBT"),
    (4, "BLAKE MONROE", "MANDY ROSE", "Others", "t10", 0.6, "FBT"),
    (4, "CODY RHODES", "KEVIN OWENS", "Others", "t10", 0.6, "FBT"),
    (4, "TRIPLE H", "JOE COFFEY", "Others", "t10", 0.7, "FBT"),
    (4, "STONE COLD", "D-VON DUDLEY", "Others", "t10", 0.7, "FBT"),
    (4, "WBBL", "Sydney Thunder W", "WBBL", "t20", 0.8, "OFBT"),
    (4, "England", "Sri Lanka", "One Day Internationals", "odi", 1.0, "OFBT"),
    (4, "New Zealand", "India", "Test Matches", "test", 1.2, "OFBT"),
    (4, "Tamil Nadu", "Railways", "Ranji Trophy", "test", 1.3, "FBT"),
    (2, "H Dart", "Tjen", "WTA", "tennis", -0.2, "OFBT"),
    (2, "A Sasnovich", "Di Shnaider", "WTA", "tennis", -0.1, "OFBT"),
    (2, "Kozyreva M / Lumsden M", "Haverlag I / Kulambayeva Z", "WTA", "tennis", 0.1, "OFBT"),
    (1, "Parma", "Udinese", "Serie A", "football", 0.2, "OFBT"),
    (1, "Venezia", "Inter Milan", "Serie A", "football", 0.3, "OFBT"),
    (4, "Karnataka", "Saurashtra", "Ranji Trophy", "test", -30, "OFBT"),
    (4, "Punjab", "Chhattisgarh", "Ranji Trophy", "test", -29, "FBT"),
    (4, "South Africa", "Australia", "Test Matches", "test", -26, "OFBT"),
    (4, "Sydney Thunder W", "Sydney Sixers W", "Women's T20 Spring Challenge", "t20", -1, "OFBT"),
    (4, "Pakistan", "England", "One Day Internationals", "odi", -2, "OFBPT"),
    (4, "South Australia", "Queensland", "Sheffield Shield", "test", -5, "PT"),
    (4, "Paarl Royals SRL", "Joburg Super Kings SRL", "Simulated Reality League / SA T20 League SRL", "t20", 0.5, "OP"),
    (4, "Netherlands T10", "Zimbabwe T10", "Others", "t10", 2, "BT"),
    (4, "Wellington Firebirds SRL", "Otago Volts SRL", "Simulated Reality League / Super Smash SRL", "t20", 3, "P"),
    (4, "Bangladesh", "West Indies", "T20 Internationals", "t20", 4, "OFBT"),
    (4, "Trent Rockets SO", "Welsh Fire SO", "Others", "t10", 5, "BT"),
    (4, "India", "New Zealand", "Test Matches", "test", 18, "OFBT"),
    (4, "Sri Lanka", "Afghanistan", "One Day Internationals", "odi", 22, "OBT"),
    (4, "Mumbai", "Delhi", "Ranji Trophy", "test", 30, "FBT"),
    (4, "Mumbai Indians SRL", "Chennai Super Kings SRL", "Simulated Reality League / Premier League SRL", "t20", -1.0, "OFBPT"),
    (4, "Kolkata Knight Riders SRL", "Delhi Capitals SRL", "Simulated Reality League / Premier League SRL", "t20", 1.5, "OP"),
    (4, "Rajasthan Royals SRL", "Punjab Kings SRL", "Simulated Reality League / Premier League SRL", "t20", 2.0, "OFBT"),
    (4, "Lucknow Super Giants SRL", "Sunrisers Hyderabad SRL", "Simulated Reality League / Premier League SRL", "t20", 2.5, "OFBT"),
    (4, "Adelaide Strikers SRL", "Brisbane Heat SRL", "Simulated Reality League / Big Bash League SRL", "t20", -1.8, "OFBPT"),
    (4, "Melbourne Stars SRL", "Perth Scorchers SRL", "Simulated Reality League / Big Bash League SRL", "t20", 3.0, "OFBT"),
    (4, "Sydney Sixers SRL", "Melbourne Renegades SRL", "Simulated Reality League / Big Bash League SRL", "t20", 3.5, "P"),
    (4, "Sharjah Warriors", "Dubai Capitals", "International League T20", "t20", 4.0, "OFBT"),
    (4, "Abu Dhabi Knight Riders", "MI Emirates", "International League T20", "t20", 4.5, "OFBT"),
    (4, "Gulf Giants", "Desert Vipers", "International League T20", "t20", 5.0, "OFBPT"),
    (4, "Australia", "India", "Test Matches", "test", -20, "OFBT"),
    (4, "England", "West Indies", "Test Matches", "test", -15, "OFBT"),
    (4, "South Africa", "Sri Lanka", "Test Matches", "test", 6.0, "OFBT"),
    (4, "Afghanistan", "Bangladesh", "One Day Internationals", "odi", 7.0, "OBT"),
    (4, "Zimbabwe", "Ireland", "One Day Internationals", "odi", 8.0, "OBT"),
    (4, "Scotland", "Netherlands", "T20 Internationals", "t20", 8.5, "OFBT"),
    (4, "Nepal", "United Arab Emirates", "T20 Internationals", "t20", 9.0, "OFBT"),
    (4, "USA", "Canada", "T20 Internationals", "t20", 9.5, "OFBT"),
    (4, "Oman", "Namibia", "T20 Internationals", "t20", 10.0, "OFBT"),
    (4, "Tamil Nadu", "Karnataka", "Ranji Trophy", "test", 12.0, "FBT"),
    (4, "Baroda", "Mumbai", "Ranji Trophy", "test", 14.0, "FBT"),
    (4, "Bengal", "Gujarat", "Ranji Trophy", "test", 16.0, "FBT"),
    (4, "Delhi", "Uttar Pradesh", "Ranji Trophy", "test", 18.0, "FBT"),

    # ---- Football ----
    (1, "Arsenal", "Chelsea", "English Premier League", "football", -0.6, "OBPT"),
    (1, "Bayern Munich", "Borussia Dortmund", "German Bundesliga", "football", -1.2, "OPT"),
    (1, "Mumbai City", "Kerala Blasters", "Indian Super League", "football", 1, "OBT"),
    (1, "Liverpool", "Manchester City", "English Premier League", "football", 2.5, "OBPT"),
    (1, "Real Madrid", "Barcelona", "Spanish La Liga", "football", 4, "OPT"),
    (1, "Inter", "AC Milan", "Italian Serie A", "football", 7, "OP"),
    (1, "PSG", "Marseille", "French Ligue 1", "football", 9, "O"),
    (1, "Ajax", "PSV", "Dutch Eredivisie", "football", 26, "O"),
    (1, "Celtic", "Rangers", "Scottish Premiership", "football", 28, "OP"),
    (1, "Al Nassr", "Al Hilal", "Saudi Pro League", "football", 32, "O"),
    (1, "Tottenham", "Aston Villa", "English Premier League", "football", -0.4, "OBPT"),
    (1, "Newcastle", "Manchester United", "English Premier League", "football", 3.0, "OBT"),
    (1, "Juventus", "Roma", "Italian Serie A", "football", -1.0, "OBPT"),
    (1, "Atletico Madrid", "Sevilla", "Spanish La Liga", "football", 5.5, "OBT"),
    (1, "Mohun Bagan SG", "East Bengal FC", "Indian Super League", "football", -0.2, "OBPT"),
    (1, "Goa FC", "Bengaluru FC", "Indian Super League", "football", 4.0, "OBT"),

    # ---- Tennis ----
    (2, "C Alcaraz", "J Sinner", "ATP Vienna", "tennis", -1, "OT"),
    (2, "I Swiatek", "A Sabalenka", "WTA Finals", "tennis", -0.5, "OT"),
    (2, "N Djokovic", "D Medvedev", "ATP Basel", "tennis", 1.5, "OT"),
    (2, "A Zverev", "T Fritz", "ATP Vienna", "tennis", 3, "O"),
    (2, "C Gauff", "E Rybakina", "WTA Finals", "tennis", 5, "O"),
    (2, "H Rune", "C Ruud", "ATP Basel", "tennis", 20, "O"),
    (2, "S Tsitsipas", "A de Minaur", "ATP Vienna", "tennis", 24, ""),
    (2, "J Pegula", "Q Zheng", "WTA Finals", "tennis", 27, "O"),
    (2, "A Rublev", "G Dimitrov", "ATP Vienna", "tennis", -0.8, "OT"),
    (2, "H Hurkacz", "C Norrie", "ATP Basel", "tennis", 2.0, "O"),

    # ---- Kabaddi ----
    (99994, "Patna Pirates", "Jaipur Pink Panthers", "Pro Kabaddi League", "kabaddi", -0.3, "OB"),
    (99994, "Bengaluru Bulls", "U Mumba", "Pro Kabaddi League", "kabaddi", 2, "OB"),
    (99994, "Puneri Paltan", "Dabang Delhi KC", "Pro Kabaddi League", "kabaddi", -0.7, "OB"),
    (99994, "Tamil Thalaivas", "Gujarat Giants", "Pro Kabaddi League", "kabaddi", 3.5, "OB"),

    # ---- Basketball ----
    (7522, "Los Angeles Lakers", "Boston Celtics", "NBA", "basketball", -0.8, "OT"),
    (7522, "Golden State Warriors", "Denver Nuggets", "NBA", "basketball", 3, "O"),
    (7522, "Milwaukee Bucks", "Miami Heat", "NBA", "basketball", 6, "O"),
    (7522, "Phoenix Suns", "Dallas Mavericks", "NBA", "basketball", -0.3, "OT"),
    (7522, "New York Knicks", "Philadelphia 76ers", "NBA", "basketball", 2.2, "O"),

    # ---- Baseball ----
    (7511, "Los Angeles Dodgers", "New York Yankees", "MLB World Series", "baseball", 1, "O"),
    (7511, "Houston Astros", "Texas Rangers", "MLB World Series", "baseball", -0.5, "O"),
]

# Seconds per ball (Test matches move slower so an innings lasts the 6-hour
# block), and per-over run rate / wicket chance, by cricket format
BALL_SECONDS = 40
TEST_BALL_SECONDS = 90
RUN_RATE = {"test": 3.3, "odi": 5.6, "t20": 8.3, "t10": 11.5}
WICKET_CHANCE = {"test": 0.07, "odi": 0.1, "t20": 0.17, "t10": 0.2}
BATTERS = ["R Sharma", "V Patel", "A Singh", "K Rao", "S Iyer", "M Khan",
           "D Joshi", "H Desai", "N Reddy", "P Kumar", "T Mehta", "J Shah"]

# Betfair-style price ladder: (prices below this, step)
TICKS = [(2, 0.01), (3, 0.02), (4, 0.05), (6, 0.1), (10, 0.2), (20, 0.5),
         (30, 1), (50, 2), (100, 5), (1000, 10)]


def _block_start(now: float) -> float:
    return now - (now % BLOCK_SECONDS)


def _snap(price: float) -> float:
    price = min(1000.0, max(1.01, price))
    for limit, step in TICKS:
        if price < limit:
            return round(round(price / step) * step, 2)
    return 1000.0


def _tick_up(price: float) -> float:
    for limit, step in TICKS:
        if price < limit - 1e-9:
            return round(price + step, 2)
    return price


def _tick_down(price: float) -> float:
    for limit, step in TICKS:
        if price <= limit + 1e-9:
            return max(1.01, round(price - step, 2))
    return price


def _size(seed: str) -> float:
    r = random.Random(seed)
    return round(r.uniform(2, 2500) * r.choice([1, 1, 1, 10]), 2)


def _ordinal(n: int) -> str:
    suffix = "th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).isoformat()


class MockFeed(MarketFeed):
    # ---- fixtures -------------------------------------------------------

    def _fixtures(self, now: float) -> list[dict]:
        out = []
        for i, (sport_id, home, away, comp, fmt, offset_h, flags) in enumerate(FIXTURES):
            start = _block_start(now) + offset_h * 3600
            end = start + max(24, FORMATS[fmt]["hours"]) * 3600
            draw = FORMATS[fmt]["draw"]
            out.append({
                "event_id": EVENT_ID_BASE + i,
                "sport_id": sport_id,
                "sport_name": SPORT_NAMES[sport_id],
                "name": f"{home} v {away}",
                "home": home,
                "away": away,
                "runners": [home, "The Draw", away] if draw else [home, away],
                "competition": comp,
                "format": fmt,
                "start": start,
                "open_date": _iso(start),
                "inplay": start <= now,
                "flags": flags,
                "badges": {
                    "fancy": "F" in flags,
                    "bookmaker": "B" in flags,
                    "premium": "P" in flags,
                    "tv": "T" in flags,
                },
            })
        return out

    # ---- prices ---------------------------------------------------------

    def _probabilities(self, fx: dict, now: float) -> list[float]:
        rng = random.Random(f"p-{fx['event_id']}")
        a = rng.uniform(0.18, 0.82)
        if len(fx["runners"]) == 3:
            d = rng.uniform(0.08, 0.32)
            base = [a * (1 - d), d, (1 - a) * (1 - d)]
        else:
            base = [a, 1 - a]
        drifted = [p * math.exp(0.12 * math.sin(now / 37 + rng.uniform(0, 6.28))) for p in base]
        total = sum(drifted)
        return [p / total for p in drifted]

    def _runner_prices(self, fx: dict, now: float, depth: int) -> list[dict]:
        eid = fx["event_id"]
        spread = random.Random(f"s-{eid}").choice([1, 1, 2, 3])
        tick = int(now // 3)
        runners = []
        for idx, (name, p) in enumerate(zip(fx["runners"], self._probabilities(fx, now))):
            back = _snap(0.99 / p)
            lay = back
            for _ in range(spread):
                lay = _tick_up(lay)
            backs, lays = [back], [lay]
            for _ in range(depth - 1):
                backs.append(_tick_down(backs[-1]))
                lays.append(_tick_up(lays[-1]))
            runners.append({
                "name": name,
                "back": [{"price": pr, "size": _size(f"{eid}-{idx}-b{lv}-{tick}")} for lv, pr in enumerate(backs)],
                "lay": [{"price": pr, "size": _size(f"{eid}-{idx}-l{lv}-{tick}")} for lv, pr in enumerate(lays)],
            })
        return runners

    def _list_odds(self, fx: dict, now: float) -> list[Optional[dict]]:
        if "O" not in fx["flags"]:
            return [None, None, None]
        runners = self._runner_prices(fx, now, depth=1)
        slots = [{"back": r["back"][0], "lay": r["lay"][0]} for r in runners]
        return slots if len(slots) == 3 else [slots[0], None, slots[1]]

    # ---- cricket --------------------------------------------------------

    def _innings(self, eid: int, inn: int, balls: int, fmt: str, target: Optional[int]) -> dict:
        runs = wickets = partnership = 0
        series: list[float] = []
        played = 0
        for over in range((balls + 5) // 6):
            r = random.Random(f"{eid}-{inn}-{over}")
            over_runs = max(0, round(r.gauss(RUN_RATE[fmt], 2.6)))
            fell = r.random() < WICKET_CHANCE[fmt]
            in_over = min(6, balls - over * 6)
            if in_over < 6:
                over_runs = round(over_runs * in_over / 6)
                fell = fell and in_over >= 3
            runs += over_runs
            partnership += over_runs
            played = over * 6 + in_over
            if fell:
                wickets += 1
                partnership = 0
            if in_over == 6:
                series.append(round(runs / (over + 1), 2))
            if wickets == 10 or (target and runs >= target):
                break
        return {"runs": runs, "wickets": wickets, "balls": played,
                "partnership": partnership, "series": series}

    def _cricket_score(self, fx: dict, now: float) -> dict:
        eid, fmt = fx["event_id"], fx["format"]
        cap = FORMATS[fmt]["overs"] * 6
        rng = random.Random(f"score-{eid}")
        if fmt == "test":
            # Second innings, picked up part-way through the day's play
            first_runs = rng.randint(240, 420)
            first = {"runs": first_runs, "wickets": 10, "balls": int(first_runs * 6 / rng.uniform(2.8, 3.6))}
            balls = rng.randint(60, 260) + int((now - _block_start(now)) / TEST_BALL_SECONDS)
            current = self._innings(eid, 2, min(balls, cap), fmt, None)
            innings = 2
        else:
            balls = int((now - fx["start"]) / BALL_SECONDS) + 1
            first = self._innings(eid, 1, min(balls, cap), fmt, None)
            first_done = first["wickets"] == 10 or first["balls"] >= cap
            if first_done and balls > first["balls"]:
                innings = 2
                current = self._innings(eid, 2, min(balls - first["balls"], cap), fmt, first["runs"] + 1)
            else:
                innings, current, first = 1, first, None

        batting = fx["home"] if innings == 1 else fx["away"]
        bowling = fx["away"] if innings == 1 else fx["home"]
        target = first["runs"] + 1 if first and fmt != "test" else None
        complete = (current["wickets"] == 10 or current["balls"] >= cap
                    or bool(target and current["runs"] >= target)) and innings == 2
        b = current["balls"]
        overs = f"{b // 6}.{b % 6}"
        crr = round(current["runs"] * 6 / b, 2) if b else 0.0

        if first is None:
            first_summary = None
        elif first["wickets"] == 10:
            first_summary = f"{first['runs']} All Out"
        else:
            first_summary = f"{first['runs']}/{first['wickets']}"

        if current["wickets"] == 10 and not target:
            message = f"{batting} {current['runs']} All Out"
        elif complete and target and current["runs"] >= target:
            message = f"{batting} won by {10 - current['wickets']} wickets"
        elif complete and target:
            message = f"{bowling} won by {target - 1 - current['runs']} runs"
        elif target:
            need = target - current["runs"]
            message = f"{batting} need {need} runs from {cap - b} balls"
        else:
            message = f"{batting} are {current['runs']} for {current['wickets']} after {overs} overs."

        seed = rng.randint(0, 100)
        w = current["wickets"]
        lead = int(current["partnership"] * 0.6)
        batters = [
            {"name": BATTERS[(seed + w) % len(BATTERS)], "runs": lead + (seed % 30 if w < 2 else 0)},
            {"name": BATTERS[(seed + w + 5) % len(BATTERS)], "runs": current["partnership"] - lead},
        ]
        return {
            "type": "cricket",
            "format": fmt,
            "innings": innings,
            "batting": batting,
            "bowling": bowling,
            "runs": current["runs"],
            "wickets": current["wickets"],
            "balls": b,
            "overs": overs,
            "crr": crr,
            "max_overs": cap // 6,
            "first_innings": first_summary,
            "first_innings_rr": round(first["runs"] * 6 / first["balls"], 2) if first and first["balls"] else None,
            "target": target,
            "message": message,
            "complete": complete,
            "rr_series": current["series"],
            "batters": batters,
        }

    def _fancy(self, fx: dict, score: dict, now: float) -> tuple[list[dict], Optional[dict]]:
        eid = fx["event_id"]
        abbr = score["batting"][:3].upper()
        balls, runs = score["balls"], score["runs"]
        cap = score["max_overs"] * 6
        rate = runs * 6 / balls if balls else RUN_RATE[score["format"]]
        next_ten = (balls // 60 + 1) * 10
        tens = [o for o in range(next_ten, next_ten + 40, 10) if o * 6 <= cap]

        def status(i: int) -> str:
            if score["complete"]:
                return "SUSPENDED"
            return "BALL_RUNNING" if (now + i * 7) % 30 < 5 else "OPEN"

        lines: list[dict] = []
        for i, o in enumerate(tens[:1]):
            projected = runs + (o * 6 - balls) * rate / 6 + math.sin(now / 20 + i)
            no = int(projected)
            lines.append({"name": f"{o} Over Runs {abbr}", "type": "session",
                          "no": {"value": no, "rate": 100}, "yes": {"value": no + 1, "rate": 100},
                          "min": 100, "max": 50000})
        if score["wickets"] < 10:
            fow = runs + 12 + random.Random(f"fow-{eid}-{score['wickets']}").randint(5, 30)
            lines.append({"name": f"Fall Of {_ordinal(score['wickets'] + 1)} Wkt Runs {abbr}", "type": "session",
                          "no": {"value": fow, "rate": 110}, "yes": {"value": fow, "rate": 90},
                          "min": 100, "max": 15000})
        for bt in score["batters"]:
            v = bt["runs"] + random.Random(f"bt-{eid}-{bt['name']}").randint(6, 14)
            lines.append({"name": f"{bt['name']} Runs", "type": "session",
                          "no": {"value": v, "rate": 110}, "yes": {"value": v, "rate": 90},
                          "min": 100, "max": 15000})
        for o in tens:
            lines.append({"name": f"{o} Over Odd Even Run Bhav {abbr}", "type": "oddeven",
                          "no": {"value": 1.96, "rate": "ODD"}, "yes": {"value": 1.96, "rate": "EVEN"},
                          "min": 100, "max": 25000})
        for i, line in enumerate(lines):
            line["id"] = f"{eid}-f{i}"
            line["status"] = status(i)

        last_digit = None
        if tens:
            last_digit = {
                "id": f"{eid}-ld",
                "name": f"{tens[0]} OVER {abbr} LAST DIGIT",
                "status": status(99),
                "runners": [{"name": f"{d} Number", "back": {"price": 9.8, "size": 1000000}} for d in range(10)],
            }
        return lines, last_digit

    # ---- other sports ---------------------------------------------------

    def _ball_game_score(self, fx: dict, now: float) -> dict:
        eid, fmt = fx["event_id"], fx["format"]
        minutes = int((now - fx["start"]) / 60)
        if fmt == "tennis":
            sets: list[list[int]] = [[0, 0]]
            for g in range(minutes // 4):
                cur = sets[-1]
                cur[random.Random(f"{eid}-g{g}").random() < 0.5] += 1
                if max(cur) >= 6 and abs(cur[0] - cur[1]) >= 2 or max(cur) == 7:
                    sets.append([0, 0])
            return {"type": "tennis",
                    "home": " ".join(str(s[0]) for s in sets),
                    "away": " ".join(str(s[1]) for s in sets),
                    "status": f"Set {len(sets)}"}
        if fmt == "football":
            clock = min(90, minutes if minutes < 45 else max(45, minutes - 15))
            goals = [0, 0]
            for seg in range(clock // 10):
                r = random.Random(f"{eid}-seg{seg}")
                if r.random() < 0.22:
                    goals[r.random() < 0.5] += 1
            status = "HT" if 45 <= minutes < 60 else f"{max(1, clock)}'"
            return {"type": "football", "home": str(goals[0]), "away": str(goals[1]), "status": status}
        # basketball, baseball, kabaddi: running points total
        per_min = {"basketball": 1.6, "baseball": 0.06, "kabaddi": 0.9}.get(fmt, 1)
        r = random.Random(f"pts-{eid}")
        home = int(minutes * per_min * r.uniform(0.85, 1.15))
        away = int(minutes * per_min * r.uniform(0.85, 1.15))
        return {"type": fmt, "home": str(home), "away": str(away), "status": "Live"}

    # ---- MarketFeed -----------------------------------------------------

    def _public(self, fx: dict, now: float) -> dict:
        return {
            "event_id": fx["event_id"],
            "sport_id": fx["sport_id"],
            "sport_name": fx["sport_name"],
            "name": fx["name"],
            "competition": fx["competition"],
            "open_date": fx["open_date"],
            "inplay": fx["inplay"],
            "badges": fx["badges"],
            "exposure": 0,
            "odds": self._list_odds(fx, now),
            "source": "mock",
        }

    def sports(self) -> list[dict]:
        fixtures = self._fixtures(time.time())
        live_counts = {
            4: (88, 34),       # Cricket
            1: (112, 24),     # Football
            2: (78, 18),      # Tennis
            7522: (82, 5),    # Basketball
            99991: (1, 0),    # Binary
        }
        return [{
            "id": sid,
            "name": name,
            "event_count": max(live_counts.get(sid, (0, 0))[0], sum(1 for f in fixtures if f["sport_id"] == sid)),
            "inplay_count": max(live_counts.get(sid, (0, 0))[1], sum(1 for f in fixtures if f["sport_id"] == sid and f["inplay"])),
        } for sid, name in SPORTS]

    def events(self, sport_id: Optional[int] = None, inplay_only: bool = False) -> list[dict]:
        now = time.time()
        fixtures = [f for f in self._fixtures(now)
                    if (sport_id is None or f["sport_id"] == sport_id) and (f["inplay"] or not inplay_only)]
        # Show in-play matches first, preserving live fixture sequence
        fixtures.sort(key=lambda f: not f["inplay"])
        return [self._public(f, now) for f in fixtures]

    def event(self, event_id: int) -> Optional[dict]:
        now = time.time()
        fx = next((f for f in self._fixtures(now) if f["event_id"] == event_id), None)
        if fx is None:
            return None
        detail = self._public(fx, now)
        detail.update({"home": fx["home"], "away": fx["away"], "score": None})
        markets: dict = {"match_odds": None, "bookmaker": None, "fancy": [], "last_digit": None}

        if "O" in fx["flags"]:
            markets["match_odds"] = {"id": f"{fx['event_id']}-mo", "name": "Match Odds", "status": "OPEN",
                                     "min": 100, "max": 200000,
                                     "runners": self._runner_prices(fx, now, depth=3)}
        cricket = fx["format"] in CRICKET_FORMATS
        if fx["inplay"]:
            detail["score"] = self._cricket_score(fx, now) if cricket else self._ball_game_score(fx, now)
        if "B" in fx["flags"]:
            ball_running = cricket and fx["inplay"] and now % 30 < 5
            markets["bookmaker"] = {
                "id": f"{fx['event_id']}-bm", "name": "Bookmaker",
                "status": "BALL_RUNNING" if ball_running else "OPEN",
                "min": 100, "max": 500000,
                "runners": [{"name": name, "back": round((0.99 / p - 1) * 100), "lay": round((0.99 / p - 1) * 100) + 2}
                            for name, p in zip(fx["runners"], self._probabilities(fx, now))],
            }
        if cricket and "F" in fx["flags"] and detail["score"]:
            markets["fancy"], markets["last_digit"] = self._fancy(fx, detail["score"], now)
        detail["markets"] = markets
        return detail

    def news(self, brand_name: str) -> list[str]:
        return [
            f"WELCOME TO {brand_name.upper()} — LIVE CRICKET, FOOTBALL & TENNIS MARKETS 24x7",
            "FANCY & BOOKMAKER MARKETS OPEN ON ALL LIVE CRICKET MATCHES",
        ]
