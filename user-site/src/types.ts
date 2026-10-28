// Shapes returned by the Rolex backend under /api/v1/player

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
    balance: number
    exposure: number
    available: number
    master: string | null
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
    // Runner 1, the draw, runner 2
    odds: (OddsSlot | null)[]
    // "mock" while the live feed is unavailable: demo prices
    source?: string
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
        fancy: unknown[]
        last_digit: unknown | null
    }
    // {market_id: {runner: profit/loss if that runner wins}}
    positions: Record<string, Record<string, number>>
    betting_open: boolean
}

export type MarketType = 'match_odds' | 'bookmaker'
export type Side = 'back' | 'lay'

// What the player clicked: becomes a bet slip
export interface Selection {
    marketType: MarketType
    marketId: string
    runner: string
    runners: string[]
    side: Side
    // Decimal odds (Match Odds) or rate (Bookmaker) as shown
    rate: number
    min: number
    max: number
}

export interface Bet {
    id: number
    client: string
    event_id: number
    event_name: string
    sport_name: string | null
    market: MarketType
    market_id: string
    market_name: string
    runner: string
    side: Side
    rate: number
    stake: number
    pl: number
    liability: number
    status: 'open' | 'won' | 'lost' | 'void'
    demo_odds: boolean
    placed_at: string
    settled_at: string | null
}

export interface StatementRow {
    id: number
    date: string
    type: string | null
    description: string | null
    credit: number
    debit: number
    balance: number
}
