import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BetSlip from '../components/BetSlip'
import { usePageTitle } from '../components/Layout'
import { Bookmaker, FancyMarkets, MatchOdds, type SlipPreview } from '../components/markets'
import Scoreboard from '../components/Scoreboard'
import { api } from '../lib/api'
import { fmtAmount, fmtEventDate } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import type { Bet, BookmakerMarket, Selection } from '../types'

const MARKET_REFRESH_MS = 1000

function OpenBets({ bets }: { bets: Bet[] }) {
    return (
        <div className="open-bets-container">
            {bets.length ? (
                <table className="mini-table">
                    <thead>
                        <tr>
                            <th>Runner</th>
                            <th className="num">Rate</th>
                            <th className="num">Stake</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bets.map((b) => (
                            <tr key={b.id} className={b.side}>
                                <td>
                                    {b.runner}
                                    <small>{b.market === 'bookmaker' ? 'Bookmaker' : 'Match Odds'}</small>
                                </td>
                                <td className="num">{b.rate}</td>
                                <td className="num">{fmtAmount(b.stake)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="side-empty-panel">No open bets on this match</div>
            )}
        </div>
    )
}

export default function EventPage() {
    const eventId = Number(useParams().eventId)
    const { data: event, error, reload } = usePolling(() => api.event(eventId), MARKET_REFRESH_MS, eventId)
    const { data: bets, reload: reloadBets } = usePolling(() => api.bets({ status: 'open', event_id: eventId }), 5000, eventId)
    const [selection, setSelection] = useState<Selection | null>(null)
    const [amounts, setAmounts] = useState<{ win: number; lose: number } | null>(null)
    const [sideTab, setSideTab] = useState<'place' | 'mybets'>('place')

    usePageTitle(event?.name ?? 'Match')

    const onSlipChange = useCallback((a: { win: number; lose: number } | null) => setAmounts(a), [])
    const closeSlip = useCallback(() => {
        setSelection(null)
        setAmounts(null)
    }, [])
    const onPlaced = useCallback(() => {
        closeSlip()
        reload()
        reloadBets()
    }, [closeSlip, reload, reloadBets])

    const handlePick = useCallback((sel: Selection) => {
        setSelection(sel)
        setSideTab('place')
    }, [])

    if (!event) {
        return error ? (
            <div className="error-box">
                {error}. <Link to="/home">Back to matches</Link>
            </div>
        ) : (
            <div className="loading">Loading match…</div>
        )
    }

    const { match_odds, bookmaker, fancy } = event.markets
    const preview: SlipPreview | null =
        selection && amounts ? { marketId: selection.marketId, runner: selection.runner, ...amounts } : null

    // Mini Bookmaker market derived or separate for display matching screenshot 4
    const miniBookmaker: BookmakerMarket | null = bookmaker
        ? {
              ...bookmaker,
              id: `${bookmaker.id}-mini`,
              name: 'MINI BOOKMAKER',
              min: 100,
              max: 200000,
          }
        : null

    const common = { canBet: event.betting_open, onPick: handlePick, preview }

    const openBetsCount = bets?.length ?? 0

    return (
        <div className="event-page-container">
            {/* Top Match Header Bar matching Screenshot 3 & 4 */}
            <div className="event-top-banner">
                <span className="event-banner-title">{event.name.toUpperCase()}</span>
                <span className="event-banner-time">
                    {event.inplay && <span className="live-dot" title="In play" />}
                    {fmtEventDate(event.open_date)}
                </span>
            </div>

            {!event.betting_open && (
                <div className="warning-banner">Betting is paused: live odds are temporarily unavailable.</div>
            )}

            <div className="event-two-column-layout">
                {/* Left Main Column: Scoreboard + All Markets */}
                <div className="event-main-column">
                    <Scoreboard event={event} />

                    {/* Match Odds */}
                    {match_odds && (
                        <MatchOdds
                            market={match_odds}
                            positions={event.positions[match_odds.id]}
                            {...common}
                        />
                    )}

                    {/* Main Bookmaker */}
                    {bookmaker && (
                        <Bookmaker
                            market={bookmaker}
                            positions={event.positions[bookmaker.id]}
                            {...common}
                        />
                    )}

                    {/* Mini Bookmaker */}
                    {miniBookmaker && (
                        <Bookmaker
                            market={miniBookmaker}
                            positions={event.positions[miniBookmaker.id]}
                            isMini={true}
                            {...common}
                        />
                    )}

                    {/* Fancy / Session Markets */}
                    <FancyMarkets
                        fancy={fancy as any}
                        canBet={event.betting_open}
                        onPick={handlePick}
                    />
                </div>

                {/* Right Side Column: Place Bet / My Bet Tabbed Container matching Screenshot 4 */}
                <div className="event-side-column">
                    <div className="betslip-box-card">
                        <div className="betslip-header-tabs">
                            <button
                                type="button"
                                className={`betslip-tab-btn ${sideTab === 'place' ? 'active' : ''}`}
                                onClick={() => setSideTab('place')}
                            >
                                Place Bet
                            </button>
                            <button
                                type="button"
                                className={`betslip-tab-btn ${sideTab === 'mybets' ? 'active' : ''}`}
                                onClick={() => setSideTab('mybets')}
                            >
                                My Bet {openBetsCount > 0 ? `(${openBetsCount})` : ''}
                            </button>
                        </div>

                        <div className="betslip-card-body">
                            {sideTab === 'place' ? (
                                selection ? (
                                    <BetSlip
                                        key={`${selection.marketId}|${selection.runner}|${selection.side}|${selection.rate}`}
                                        eventId={event.event_id}
                                        selection={selection}
                                        inplay={event.inplay}
                                        onChange={onSlipChange}
                                        onCancel={closeSlip}
                                        onPlaced={onPlaced}
                                    />
                                ) : (
                                    <div className="betslip-empty-hint">
                                        <div className="hint-icon">🎯</div>
                                        <div className="hint-text">Click on any Back or Lay odds to place your bet.</div>
                                    </div>
                                )
                            ) : (
                                <OpenBets bets={bets ?? []} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bet Slip Sheet (Active on screens < 768px when an odds button is tapped) */}
            {selection && (
                <div className="mobile-betslip-overlay" onClick={closeSlip}>
                    <div className="mobile-betslip-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className={`mobile-betslip-top-bar ${selection.side}`}>
                            <span className="mobile-betslip-tag">{selection.side.toUpperCase()}</span>
                            <span className="mobile-betslip-runner-name">{selection.runner}</span>
                            <button type="button" className="mobile-betslip-close-btn" onClick={closeSlip} aria-label="Close">
                                ✕
                            </button>
                        </div>
                        <div className="mobile-betslip-body">
                            <BetSlip
                                key={`m-${selection.marketId}|${selection.runner}|${selection.side}|${selection.rate}`}
                                eventId={event.event_id}
                                selection={selection}
                                inplay={event.inplay}
                                onChange={onSlipChange}
                                onCancel={closeSlip}
                                onPlaced={onPlaced}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
