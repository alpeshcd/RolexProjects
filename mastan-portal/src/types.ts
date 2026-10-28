// Shapes returned by the Rolex backend under /api/v1/exchange

export type Role = 'admin' | 'supermaster' | 'master' | 'client'

export interface Portal {
    domain_key: string
    domain_url: string
    brand_name: string
    domain_title: string
}

export interface Account {
    id: number
    username: string
    full_name: string | null
    role: Role
    role_label: string
    domain_key: string
    balance: number
    upline: number
    exposure: number
    credit_reference: number
    partnership: number
    child_roles: Role[]
    created_at: string | null
}

export interface Me {
    account: Account
    portal: Portal
}

export interface LoginResponse extends Me {
    access_token: string
}

export interface Sport {
    id: number
    name: string
    event_count: number
    inplay_count: number
}

export interface PriceSize {
    price: number
    size: number
}

export interface OddsSlot {
    back: PriceSize | null
    lay: PriceSize | null
}

export interface Badges {
    fancy: boolean
    bookmaker: boolean
    premium: boolean
    tv: boolean
}

export interface ExchangeEvent {
    event_id: number
    sport_id: number
    sport_name: string
    name: string
    competition: string
    open_date: string
    inplay: boolean
    badges: Badges
    exposure: number
    // Runner 1, the draw, runner 2
    odds: (OddsSlot | null)[]
}

export type MarketStatus = 'OPEN' | 'SUSPENDED' | 'BALL_RUNNING' | string

export interface Runner {
    name: string
    back: PriceSize[]
    lay: PriceSize[]
}

export interface MatchOddsMarket {
    id: string
    name: string
    status: MarketStatus
    min: number
    max: number
    runners: Runner[]
}

export interface BookmakerMarket {
    id: string
    name: string
    status: MarketStatus
    min: number
    max: number
    runners: { name: string; back: number; lay: number }[]
}

export interface FancyLine {
    id: string
    name: string
    type: 'session' | 'oddeven'
    status: MarketStatus
    no: { value: number; rate: number | string }
    yes: { value: number; rate: number | string }
    min: number
    max: number
}

export interface LastDigitMarket {
    id: string
    name: string
    status: MarketStatus
    runners: { name: string; back: PriceSize }[]
}

export interface CricketScore {
    type: 'cricket'
    format: string
    innings: number
    batting: string
    bowling: string
    runs: number
    wickets: number
    balls: number
    overs: string
    crr: number
    max_overs: number
    first_innings: string | null
    first_innings_rr: number | null
    target: number | null
    message: string
    complete: boolean
    rr_series: number[]
    batters: { name: string; runs: number }[]
}

export interface BallGameScore {
    type: string
    home: string
    away: string
    status: string
}

export interface EventDetail extends ExchangeEvent {
    home: string
    away: string
    score: CricketScore | BallGameScore | null
    markets: {
        match_odds: MatchOddsMarket | null
        bookmaker: BookmakerMarket | null
        fancy: FancyLine[]
        last_digit: LastDigitMarket | null
    }
}

// A player-site bet. Open bets show `pl` as what the client makes if the runner wins.
export interface Bet {
    id: number
    client: string
    event_id: number
    event_name: string
    market: string
    market_id: string
    market_name: string
    runner: string
    side: 'back' | 'lay'
    rate: number
    run: number | null
    stake: number
    pl: number
    liability: number
    status: 'open' | 'won' | 'lost' | 'void'
    demo_odds: boolean
    placed_at: string
}

// A market with open bets, waiting for the Admin to declare its result
export interface PendingMarket {
    market_id: string
    market_type: string
    market_name: string
    event_id: number
    event_name: string
    sport_name: string | null
    runners: string[]
    bet_count: number
    total_stake: number
    // The house's profit/loss on each runner if it wins
    book: Record<string, number>
    last_bet_at: string
}

export interface MarketResult {
    id: number
    market_id: string
    event_id: number
    event_name: string
    market_name: string
    winner: string
    bet_count: number
    declared_by: string
    declared_at: string
}

export interface DownlineRow {
    kind: 'account' | 'client'
    id: number
    username: string
    full_name: string | null
    role: Role
    role_label: string
    parent: string | null
    credit_reference: number
    balance: number
    exposure: number
    available: number
    pl: number
    partnership: number
    is_active: boolean
    created_at: string | null
}

export interface StatementRow {
    id: number
    date: string
    counterparty: string | null
    description: string | null
    credit: number
    debit: number
    balance: number
}
