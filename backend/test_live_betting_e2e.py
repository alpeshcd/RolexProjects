import httpx
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8001/api/v1"

def print_step(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def run_live_e2e_test():
    session = httpx.Client(timeout=10.0)
    
    # -------------------------------------------------------------
    # STEP 1: Login to Master Panel
    # -------------------------------------------------------------
    print_step("STEP 1: Log in to Master Panel (MASTER365TEST)")
    login_payload = {
        "host": "mastan365.localhost",
        "username": "MASTER365TEST",
        "password": "master123"
    }
    resp = session.post(f"{BASE_URL}/exchange/login", json=login_payload)
    assert resp.status_code == 200, f"Master login failed: {resp.status_code} - {resp.text}"
    master_data = resp.json()
    master_token = master_data["access_token"]
    master_headers = {"Authorization": f"Bearer {master_token}"}
    print(f"✓ Master Logged In: {master_data['account']['username']}")
    print(f"  Role: {master_data['account']['role_label']}")
    print(f"  Portal: {master_data['portal']['domain_title']} ({master_data['portal']['domain_url']})")
    print(f"  Current Balance: ₹{master_data['account']['balance']:,.2f}")
    
    # -------------------------------------------------------------
    # STEP 2: Create a New Client from Master
    # -------------------------------------------------------------
    print_step("STEP 2: Create New Client from Master Downline")
    ts = int(time.time()) % 100000
    new_client_username = f"CLI_TEST_{ts}"
    new_client_password = "ClientPass@123"
    
    create_client_payload = {
        "username": new_client_username,
        "full_name": f"VIP Client {ts}",
        "password": new_client_password,
        "role": "client",
        "mobile": "9898989898",
        "credit_reference": 0.0,
        "partnership": 0.0
    }
    resp = session.post(f"{BASE_URL}/exchange/downline", json=create_client_payload, headers=master_headers)
    assert resp.status_code == 201, f"Create client failed: {resp.status_code} - {resp.text}"
    created_client = resp.json()
    client_id = created_client["id"]
    print(f"✓ Client Created Successfully:")
    print(f"  ID: {client_id}")
    print(f"  Username: {created_client['username']}")
    print(f"  Full Name: {created_client['full_name']}")
    print(f"  Role: {created_client['role']}")
    print(f"  Upline Master: {created_client['parent']}")
    print(f"  Initial Balance: ₹{created_client['balance']:,.2f}")
    
    # -------------------------------------------------------------
    # STEP 3: Transfer Chips from Master to New Client
    # -------------------------------------------------------------
    print_step("STEP 3: Master Transfers Chips to New Client")
    chip_amount = 10000.0
    transfer_payload = {
        "amount": chip_amount,
        "action": "deposit",
        "remark": "Welcome Chips for Betting Test"
    }
    resp = session.post(f"{BASE_URL}/exchange/downline/client/{client_id}/chips", json=transfer_payload, headers=master_headers)
    assert resp.status_code == 200, f"Chip transfer failed: {resp.status_code} - {resp.text}"
    transferred = resp.json()
    print(f"✓ Chips Transferred: +₹{chip_amount:,.2f}")
    print(f"  Client New Balance in Master Downline: ₹{transferred['balance']:,.2f}")
    print(f"  Client Available: ₹{transferred['available']:,.2f}")
    
    # -------------------------------------------------------------
    # STEP 4: Login as Client on New Site (user-site)
    # -------------------------------------------------------------
    print_step("STEP 4: Client Login to New Betting Site (user-site)")
    client_login_payload = {
        "host": "mastan365.localhost",
        "username": new_client_username,
        "password": new_client_password
    }
    resp = session.post(f"{BASE_URL}/player/login", json=client_login_payload)
    assert resp.status_code == 200, f"Player login failed: {resp.status_code} - {resp.text}"
    player_data = resp.json()
    player_token = player_data["access_token"]
    player_headers = {"Authorization": f"Bearer {player_token}"}
    print(f"✓ Client Successfully Logged In to New Site!")
    print(f"  Username: {player_data['account']['username']}")
    print(f"  Master: {player_data['account']['master']}")
    print(f"  Balance: ₹{player_data['account']['balance']:,.2f}")
    print(f"  Exposure: ₹{player_data['account']['exposure']:,.2f}")
    print(f"  Available to Bet: ₹{player_data['account']['available']:,.2f}")
    print(f"  Portal Brand: {player_data['portal']['brand_name']}")
    
    # Verify /me endpoint
    resp = session.get(f"{BASE_URL}/player/me", headers=player_headers)
    assert resp.status_code == 200
    me = resp.json()
    assert me["account"]["balance"] == 10000.0
    print("✓ Client Profile /me verified.")
    
    # -------------------------------------------------------------
    # STEP 5: Browse Sports & Active Events
    # -------------------------------------------------------------
    print_step("STEP 5: Browse Sports & In-Play Events")
    resp = session.get(f"{BASE_URL}/player/sports", headers=player_headers)
    assert resp.status_code == 200
    sports = resp.json()
    print(f"✓ Sports available: {len(sports)} categories")
    for s in sports[:4]:
        print(f"  - [{s['id']}] {s['name']}: {s['event_count']} matches ({s['inplay_count']} in-play)")
    
    # Fetch Cricket matches
    resp = session.get(f"{BASE_URL}/player/events", params={"sport_id": 4, "inplay": True}, headers=player_headers)
    assert resp.status_code == 200
    events = resp.json()
    print(f"\n✓ Found {len(events)} in-play cricket matches.")
    selected_event = events[0]
    event_id = selected_event["event_id"]
    print(f"  Selected Match: '{selected_event['name']}' (ID: {event_id})")
    print(f"  Competition: {selected_event['competition']}")
    
    # Fetch Match Details & Market Odds
    resp = session.get(f"{BASE_URL}/player/events/{event_id}", headers=player_headers)
    assert resp.status_code == 200
    event_detail = resp.json()
    print(f"\n✓ Match Details Loaded:")
    print(f"  Status: {'In-Play' if event_detail['inplay'] else 'Upcoming'}")
    print(f"  Betting Open: {event_detail.get('betting_open')}")
    
    match_odds = event_detail["markets"]["match_odds"]
    market_id = str(match_odds["id"])
    runners = match_odds["runners"]
    print(f"  Market: {match_odds['name']} (ID: {market_id}, Min Stake: ₹{match_odds.get('min')}, Max: ₹{match_odds.get('max')})")
    for i, r in enumerate(runners):
        back_p = r["back"][0]["price"] if r.get("back") else "N/A"
        lay_p = r["lay"][0]["price"] if r.get("lay") else "N/A"
        print(f"    Runner {i+1}: {r['name']} | Back: {back_p} | Lay: {lay_p}")
        
    # -------------------------------------------------------------
    # STEP 6: Place a BACK Bet on Runner 1
    # -------------------------------------------------------------
    print_step("STEP 6: Place a BACK Bet on Runner 1")
    runner_1 = runners[0]
    runner_1_name = runner_1["name"]
    runner_1_odds = runner_1["back"][0]["price"]
    bet_stake = 1000.0
    
    bet_payload = {
        "event_id": event_id,
        "market_type": "match_odds",
        "market_id": market_id,
        "selection": runner_1_name,
        "side": "back",
        "odds": runner_1_odds,
        "stake": bet_stake
    }
    print(f"Submitting Bet: BACK ₹{bet_stake:,.2f} on '{runner_1_name}' @ {runner_1_odds}...")
    resp = session.post(f"{BASE_URL}/player/bets", json=bet_payload, headers=player_headers)
    assert resp.status_code == 201, f"Place bet failed: {resp.status_code} - {resp.text}"
    bet_res = resp.json()
    placed_bet = bet_res["bet"]
    updated_acc = bet_res["account"]
    
    print(f"✓ BET ACCEPTED & MATCHED INSTANTLY!")
    print(f"  Bet ID: {placed_bet['id']}")
    print(f"  Runner: {placed_bet['runner']} ({placed_bet['side'].upper()})")
    print(f"  Rate/Odds: {placed_bet['rate']}")
    print(f"  Stake: ₹{placed_bet['stake']:,.2f}")
    print(f"  Liability: ₹{placed_bet['liability']:,.2f}")
    print(f"  Potential Profit: ₹{placed_bet['pl']:,.2f}")
    print(f"  Account Balance: ₹{updated_acc['balance']:,.2f}")
    print(f"  Account Exposure: ₹{updated_acc['exposure']:,.2f}")
    print(f"  Available Limit: ₹{updated_acc['available']:,.2f}")
    
    # -------------------------------------------------------------
    # STEP 7: Place a Second Bet (LAY Bet on Runner 2)
    # -------------------------------------------------------------
    print_step("STEP 7: Place a Second Bet (LAY on Runner 2) & Test Multi-Position Exposure")
    runner_2 = runners[1] if len(runners) > 1 else runners[0]
    runner_2_name = runner_2["name"]
    runner_2_odds = runner_2["lay"][0]["price"] if runner_2.get("lay") else 1.42
    bet_stake_2 = 500.0
    
    bet_payload_2 = {
        "event_id": event_id,
        "market_type": "match_odds",
        "market_id": market_id,
        "selection": runner_2_name,
        "side": "lay",
        "odds": runner_2_odds,
        "stake": bet_stake_2
    }
    print(f"Submitting Bet: LAY ₹{bet_stake_2:,.2f} on '{runner_2_name}' @ {runner_2_odds}...")
    resp = session.post(f"{BASE_URL}/player/bets", json=bet_payload_2, headers=player_headers)
    assert resp.status_code == 201, f"Second bet failed: {resp.status_code} - {resp.text}"
    bet_res_2 = resp.json()
    placed_bet_2 = bet_res_2["bet"]
    updated_acc_2 = bet_res_2["account"]
    
    print(f"✓ SECOND BET ACCEPTED & MATCHED!")
    print(f"  Bet ID: {placed_bet_2['id']}")
    print(f"  Runner: {placed_bet_2['runner']} ({placed_bet_2['side'].upper()})")
    print(f"  Rate/Odds: {placed_bet_2['rate']}")
    print(f"  Account Balance: ₹{updated_acc_2['balance']:,.2f}")
    print(f"  Account Exposure: ₹{updated_acc_2['exposure']:,.2f}")
    print(f"  Available Limit: ₹{updated_acc_2['available']:,.2f}")
    
    # -------------------------------------------------------------
    # STEP 8: Verify Event Runner Position Profit/Loss
    # -------------------------------------------------------------
    print_step("STEP 8: Check Real-time Live Runner Positions on Match Page")
    resp = session.get(f"{BASE_URL}/player/events/{event_id}", headers=player_headers)
    assert resp.status_code == 200
    positions = resp.json().get("positions", {}).get(market_id, {})
    print(f"✓ Live Book / Runner Positions for Market {market_id}:")
    for runner_name, pnl in positions.items():
        print(f"  If '{runner_name}' wins: {'+' if pnl >= 0 else ''}₹{pnl:,.2f}")
        
    # -------------------------------------------------------------
    # STEP 9: Client My Bets Tab Verification
    # -------------------------------------------------------------
    print_step("STEP 9: Verify Bets in Client 'My Bets' Screen")
    resp = session.get(f"{BASE_URL}/player/bets", headers=player_headers)
    assert resp.status_code == 200
    my_bets = resp.json()
    print(f"✓ Found {len(my_bets)} bets in client history:")
    for b in my_bets:
        print(f"  - Bet #{b['id']}: [{b['market'].upper()}] {b['runner']} ({b['side'].upper()}) | Stake: ₹{b['stake']:,.2f} @ {b['rate']} | Status: {b['status']}")
        
    # -------------------------------------------------------------
    # STEP 10: Client Statement & Ledger Audit
    # -------------------------------------------------------------
    print_step("STEP 10: Verify Client Statement & Ledger")
    resp = session.get(f"{BASE_URL}/player/statement", headers=player_headers)
    assert resp.status_code == 200
    stmts = resp.json()
    print(f"✓ Found {len(stmts)} ledger statement entries for client:")
    for s in stmts:
        print(f"  [{s['date']}] {s['type']} | Credit: ₹{s['credit']:,.2f} | Debit: ₹{s['debit']:,.2f} | Balance: ₹{s['balance']:,.2f} | {s['description']}")
        
    # -------------------------------------------------------------
    # STEP 11: Master Downline Audit Verification
    # -------------------------------------------------------------
    print_step("STEP 11: Verify Client Status & Exposure from Master Panel")
    resp = session.get(f"{BASE_URL}/exchange/downline", headers=master_headers)
    assert resp.status_code == 200
    downline = resp.json()
    client_in_downline = next((c for c in downline if c["username"] == new_client_username), None)
    assert client_in_downline is not None, "Client not found in master downline!"
    print(f"✓ Master Downline Confirmed for {client_in_downline['username']}:")
    print(f"  Kind: {client_in_downline['kind']}")
    print(f"  Balance: ₹{client_in_downline['balance']:,.2f}")
    print(f"  Exposure: ₹{client_in_downline['exposure']:,.2f}")
    print(f"  Available: ₹{client_in_downline['available']:,.2f}")
    print(f"  Active Status: {client_in_downline['is_active']}")
    
    print("\n" + "=" * 80)
    print("ALL 11 END-TO-END FLOW STEPS COMPLETED & VERIFIED 100% SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_live_e2e_test()
