import { useState } from 'react'
import { fmtAmount, fmtPrice, fmtSize } from '../lib/format'
import type { BookmakerMarket, MarketType, MatchOddsMarket, Selection, Side } from '../types'

export interface SlipPreview {
    marketId: string
    runner: string
    win: number
    lose: number
}

interface MarketProps {
    positions: Record<string, number> | undefined
    canBet: boolean
    onPick: (sel: Selection) => void
    preview: SlipPreview | null
}

function signed(v: number): string {
    return `${v > 0 ? '+' : ''}${fmtAmount(v)}`
}

function Position({
    runner,
    positions,
    preview,
    marketId,
}: {
    runner: string
    positions: Record<string, number> | undefined
    preview: SlipPreview | null
    marketId: string
}) {
    const current = positions?.[runner]
    const next =
        preview && preview.marketId === marketId
            ? (current ?? 0) + (preview.runner === runner ? preview.win : preview.lose)
            : undefined
    if (current === undefined && next === undefined) return null
    return (
        <span className="mk-pos">
            {current !== undefined && <span className={current < 0 ? 'neg' : 'pos'}>{signed(current)}</span>}
            {next !== undefined && <span className={`mk-next ${next < 0 ? 'neg' : 'pos'}`}>» {signed(next)}</span>}
        </span>
    )
}

function pick(
    type: MarketType,
    market: { id: string; min: number; max: number },
    runner: string,
    runners: string[],
    side: Side,
    rate: number
): Selection {
    return { marketType: type, marketId: market.id, runner, runners, side, rate, min: market.min, max: market.max }
}

/* ---------------- MATCH ODDS ---------------- */
export function MatchOdds({
    market,
    positions,
    canBet,
    onPick,
    preview,
}: MarketProps & { market: MatchOddsMarket }) {
    const names = market.runners.map((r) => r.name)
    const isSuspended = market.status && market.status !== 'OPEN'

    return (
        <section className="market-box match-odds-box">
            {/* Dark teal header with (i) */}
            <div className="market-header">
                <span className="market-header-title">Match Odds</span>
                <span className="market-info-circle">i</span>
            </div>

            {/* Sub-header with Min/Max and BACK / LAY columns */}
            <div className="market-sub-head">
                <div className="market-limits">
                    Min: {fmtAmount(market.min || 100)} Max: {fmtAmount(market.max || 25000)}
                </div>
                <div className="market-head-cols mo-cols">
                    <span className="mo-head-back">BACK</span>
                    <span className="mo-head-lay">LAY</span>
                </div>
            </div>

            {/* Runners */}
            <div className="market-body">
                {market.runners.map((r) => (
                    <div className="market-runner-row" key={r.name}>
                        <div className="market-runner-info">
                            <span className="runner-name">{r.name}</span>
                            <Position runner={r.name} positions={positions} preview={preview} marketId={market.id} />
                        </div>

                        <div className="mo-price-cols">
                            {/* 3 Back Columns */}
                            <button
                                type="button"
                                className="mo-btn back depth-2"
                                disabled={!canBet || isSuspended || !r.back[2]}
                                onClick={() => r.back[2] && onPick(pick('match_odds', market, r.name, names, 'back', r.back[2].price))}
                            >
                                <span className="p-val">{r.back[2] ? fmtPrice(r.back[2].price) : '-'}</span>
                                {r.back[2] && <span className="p-size">{fmtSize(r.back[2].size)}</span>}
                            </button>
                            <button
                                type="button"
                                className="mo-btn back depth-1"
                                disabled={!canBet || isSuspended || !r.back[1]}
                                onClick={() => r.back[1] && onPick(pick('match_odds', market, r.name, names, 'back', r.back[1].price))}
                            >
                                <span className="p-val">{r.back[1] ? fmtPrice(r.back[1].price) : '-'}</span>
                                {r.back[1] && <span className="p-size">{fmtSize(r.back[1].size)}</span>}
                            </button>
                            <button
                                type="button"
                                className="mo-btn back best"
                                disabled={!canBet || isSuspended || !r.back[0]}
                                onClick={() => r.back[0] && onPick(pick('match_odds', market, r.name, names, 'back', r.back[0].price))}
                            >
                                <span className="p-val">{r.back[0] ? fmtPrice(r.back[0].price) : '-'}</span>
                                {r.back[0] && <span className="p-size">{fmtSize(r.back[0].size)}</span>}
                            </button>

                            {/* 3 Lay Columns */}
                            <button
                                type="button"
                                className="mo-btn lay best"
                                disabled={!canBet || isSuspended || !r.lay[0]}
                                onClick={() => r.lay[0] && onPick(pick('match_odds', market, r.name, names, 'lay', r.lay[0].price))}
                            >
                                <span className="p-val">{r.lay[0] ? fmtPrice(r.lay[0].price) : '-'}</span>
                                {r.lay[0] && <span className="p-size">{fmtSize(r.lay[0].size)}</span>}
                            </button>
                            <button
                                type="button"
                                className="mo-btn lay depth-1"
                                disabled={!canBet || isSuspended || !r.lay[1]}
                                onClick={() => r.lay[1] && onPick(pick('match_odds', market, r.name, names, 'lay', r.lay[1].price))}
                            >
                                <span className="p-val">{r.lay[1] ? fmtPrice(r.lay[1].price) : '-'}</span>
                                {r.lay[1] && <span className="p-size">{fmtSize(r.lay[1].size)}</span>}
                            </button>
                            <button
                                type="button"
                                className="mo-btn lay depth-2"
                                disabled={!canBet || isSuspended || !r.lay[2]}
                                onClick={() => r.lay[2] && onPick(pick('match_odds', market, r.name, names, 'lay', r.lay[2].price))}
                            >
                                <span className="p-val">{r.lay[2] ? fmtPrice(r.lay[2].price) : '-'}</span>
                                {r.lay[2] && <span className="p-size">{fmtSize(r.lay[2].size)}</span>}
                            </button>

                            {/* Suspended overlay if closed */}
                            {isSuspended && <div className="market-suspended-overlay">SUSPENDED</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom banner matching Screenshot 3 & 4 */}
            <div className="market-footer-banner">
                THE HIGHEST ODDS ALLOWED IN OUR EXCHANGE
            </div>
        </section>
    )
}

/* ---------------- BOOKMAKER ---------------- */
export function Bookmaker({
    market,
    positions,
    canBet,
    onPick,
    preview,
    isMini = false,
}: MarketProps & { market: BookmakerMarket; isMini?: boolean }) {
    const names = market.runners.map((r) => r.name)
    const isSuspended = market.status && market.status !== 'OPEN'

    return (
        <section className={`market-box bm-box ${isMini ? 'mini-bm-box' : ''}`}>
            <div className="market-header">
                <span className="market-header-title">{isMini ? 'MINI BOOKMAKER' : 'BOOKMAKER'}</span>
                <span className="market-info-circle">i</span>
            </div>

            <div className="market-sub-head">
                <div className="market-limits">
                    Min: {fmtAmount(isMini ? 100 : market.min || 100)} Max: {fmtAmount(isMini ? 200000 : market.max || 500000)}
                </div>
                <div className="market-head-cols bm-cols">
                    <span className="bm-head-back">BACK</span>
                    <span className="bm-head-lay">LAY</span>
                </div>
            </div>

            <div className="market-body">
                {market.runners.map((r) => {
                    const suspendedRow = isSuspended || r.back <= 0
                    return (
                        <div className="market-runner-row" key={r.name}>
                            <div className="market-runner-info">
                                <span className="runner-name">{r.name}</span>
                                <Position runner={r.name} positions={positions} preview={preview} marketId={market.id} />
                            </div>

                            <div className="bm-price-cols">
                                <button
                                    type="button"
                                    className="bm-btn back"
                                    disabled={!canBet || suspendedRow}
                                    onClick={() => r.back > 0 && onPick(pick('bookmaker', market, r.name, names, 'back', r.back))}
                                >
                                    <b>{r.back > 0 ? r.back : '-'}</b>
                                    <small>{r.back > 0 ? (isMini ? '200k' : '500k') : '0.0'}</small>
                                </button>
                                <button
                                    type="button"
                                    className="bm-btn lay"
                                    disabled={!canBet || suspendedRow}
                                    onClick={() => r.lay > 0 && onPick(pick('bookmaker', market, r.name, names, 'lay', r.lay))}
                                >
                                    <b>{r.lay > 0 ? r.lay : '-'}</b>
                                    <small>{r.lay > 0 ? (isMini ? '200k' : '500k') : '0.0'}</small>
                                </button>

                                {suspendedRow && <div className="bm-row-suspended">SUSPENDED</div>}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Live Ticker banner directly under Mini Bookmaker matching screenshot 4 */}
            {isMini && (
                <div className="marquee-banner">
                    <span className="marquee-text">
                        India W v Zimbabwe W : Match Bets Started 🏏 &nbsp;&nbsp;|&nbsp;&nbsp; Advance Match Bets Started ⚡
                    </span>
                </div>
            )}
        </section>
    )
}

/* ---------------- FANCY / SESSION MARKETS ---------------- */
interface FancyLine {
    id: string
    name: string
    type: string
    status: string
    min: number
    max: number
    no: { value: number | string; rate: number | string }
    yes: { value: number | string; rate: number | string }
}

const FANCY_TABS = [
    'ALL',
    'SESSIONS',
    'W/P MARKET',
    'ODD/EVEN',
    'XTRA MARKET',
    'METER',
    'KHADDA',
    'OVER',
]

export function FancyMarkets({
    fancy,
    canBet,
    onPick,
}: {
    fancy: FancyLine[]
    canBet: boolean
    onPick: (sel: Selection) => void
}) {
    const [activeTab, setActiveTab] = useState('ALL')

    // If no fancy lines from API, provide realistic session demo lines to match screenshot 4
    const lines: FancyLine[] = fancy && fancy.length > 0 ? fancy : [
        {
            id: 'f-1',
            name: '25 Over Runs AUS',
            type: 'session',
            status: 'OPEN',
            min: 100,
            max: 300000,
            no: { value: 78, rate: 100 },
            yes: { value: 79, rate: 100 },
        },
        {
            id: 'f-2',
            name: '1st Innings Runs AUS',
            type: 'session',
            status: 'OPEN',
            min: 100,
            max: 500000,
            no: { value: 340, rate: 100 },
            yes: { value: 343, rate: 100 },
        },
        {
            id: 'f-3',
            name: '23 Over Runs AUS',
            type: 'session',
            status: 'BALL_RUNNING',
            min: 100,
            max: 250000,
            no: { value: 73, rate: 100 },
            yes: { value: 73, rate: 100 },
        },
        {
            id: 'wp-1',
            name: 'Fall of 3rd wkt Runs AUS',
            type: 'wp',
            status: 'BALL_RUNNING',
            min: 100,
            max: 25000,
            no: { value: 103, rate: 110 },
            yes: { value: 103, rate: 90 },
        },
        {
            id: 'wp-2',
            name: 'M Renshaw Runs (N)',
            type: 'wp',
            status: 'BALL_RUNNING',
            min: 100,
            max: 25000,
            no: { value: 52, rate: 110 },
            yes: { value: 52, rate: 90 },
        },
        {
            id: 'wp-3',
            name: 'C Green Runs',
            type: 'wp',
            status: 'BALL_RUNNING',
            min: 100,
            max: 25000,
            no: { value: 40, rate: 110 },
            yes: { value: 40, rate: 90 },
        },
    ]

    const sessionLines = lines.filter((l) => l.type === 'session' || l.name.includes('Over Runs') || l.name.includes('Innings'))
    const wpLines = lines.filter((l) => l.type === 'wp' || l.name.includes('wkt') || l.name.includes('Runs'))

    const handlePick = (line: FancyLine, side: Side, rateVal: number) => {
        onPick({
            marketType: 'bookmaker',
            marketId: line.id,
            runner: `${line.name} (${side === 'back' ? 'Yes' : 'No'})`,
            runners: [`${line.name} (Yes)`, `${line.name} (No)`],
            side,
            rate: rateVal,
            min: line.min || 100,
            max: line.max || 50000,
        })
    }

    return (
        <section className="market-box fancy-container">
            {/* Top gold badge and category tabs */}
            <div className="fancy-tabs-bar">
                <span className="fancy-gold-badge">FANCY</span>
                <div className="fancy-nav-scroll">
                    {FANCY_TABS.map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`fancy-tab-btn ${activeTab === t ? 'active' : ''}`}
                            onClick={() => setActiveTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Two Column Grid: sessions | w/p market */}
            <div className="fancy-two-col-grid">
                {/* Left Column: sessions */}
                <div className="fancy-col">
                    <div className="fancy-col-head">
                        <span>sessions</span>
                        <span className="market-info-circle">i</span>
                    </div>

                    <div className="fancy-table-header">
                        <span className="fth-game" />
                        <span className="fth-no">No</span>
                        <span className="fth-yes">Yes</span>
                    </div>

                    <div className="fancy-table-body">
                        {sessionLines.map((line) => {
                            const isBallRunning = line.status === 'BALL_RUNNING'
                            const noVal = typeof line.no.value === 'number' ? line.no.value : 0
                            const yesVal = typeof line.yes.value === 'number' ? line.yes.value : 0

                            return (
                                <div className="fancy-row" key={line.id}>
                                    <div className="fancy-row-name">
                                        <span>{line.name}</span>
                                    </div>

                                    <div className="fancy-row-prices">
                                        <button
                                            type="button"
                                            className="fancy-btn fancy-no"
                                            disabled={!canBet || isBallRunning}
                                            onClick={() => handlePick(line, 'lay', noVal)}
                                        >
                                            <span className="f-val">{line.no.value}</span>
                                            <span className="f-rate">{line.no.rate}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="fancy-btn fancy-yes"
                                            disabled={!canBet || isBallRunning}
                                            onClick={() => handlePick(line, 'back', yesVal)}
                                        >
                                            <span className="f-val">{line.yes.value}</span>
                                            <span className="f-rate">{line.yes.rate}</span>
                                        </button>

                                        {isBallRunning && (
                                            <div className="ball-running-overlay">BALL RUNNING</div>
                                        )}
                                    </div>

                                    <div className="fancy-limits-text">
                                        <span>Min: {line.min}</span>
                                        <span>Max: {fmtAmount(line.max)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: w/p market */}
                <div className="fancy-col">
                    <div className="fancy-col-head">
                        <span>w/p market</span>
                        <span className="market-info-circle">i</span>
                    </div>

                    <div className="fancy-table-header">
                        <span className="fth-game" />
                        <span className="fth-no">No</span>
                        <span className="fth-yes">Yes</span>
                    </div>

                    <div className="fancy-table-body">
                        {wpLines.map((line) => {
                            const isBallRunning = line.status === 'BALL_RUNNING'
                            const noVal = typeof line.no.value === 'number' ? line.no.value : 0
                            const yesVal = typeof line.yes.value === 'number' ? line.yes.value : 0

                            return (
                                <div className="fancy-row" key={line.id}>
                                    <div className="fancy-row-name">
                                        <span>{line.name}</span>
                                    </div>

                                    <div className="fancy-row-prices">
                                        <button
                                            type="button"
                                            className="fancy-btn fancy-no"
                                            disabled={!canBet || isBallRunning}
                                            onClick={() => handlePick(line, 'lay', noVal)}
                                        >
                                            <span className="f-val">{line.no.value}</span>
                                            <span className="f-rate">{line.no.rate}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="fancy-btn fancy-yes"
                                            disabled={!canBet || isBallRunning}
                                            onClick={() => handlePick(line, 'back', yesVal)}
                                        >
                                            <span className="f-val">{line.yes.value}</span>
                                            <span className="f-rate">{line.yes.rate}</span>
                                        </button>

                                        {isBallRunning && (
                                            <div className="ball-running-overlay">BALL RUNNING</div>
                                        )}
                                    </div>

                                    <div className="fancy-limits-text">
                                        <span>Min: {line.min}</span>
                                        <span>Max: {fmtAmount(line.max)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
