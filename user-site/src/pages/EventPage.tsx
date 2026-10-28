import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BetSlip from '../components/BetSlip'
import DemoNote from '../components/DemoNote'
import { usePageTitle } from '../components/Layout'
import { Bookmaker, MatchOdds, type SlipPreview } from '../components/markets'
import Scoreboard from '../components/Scoreboard'
import { api } from '../lib/api'
import { fmtAmount, fmtEventDate } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import type { Bet, Selection } from '../types'

const MARKET_REFRESH_MS = 1000

function OpenBets({ bets }: { bets: Bet[] }) {
    return (
        <div className="side-box">
            <div className="side-head">My Bets ({bets.length})</div>
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
                <div className="side-empty">No open bets on this match</div>
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

    const slipFor = (marketId: string) =>
        selection?.marketId === marketId
            ? {
                  slipRunner: selection.runner,
                  slip: (
                      <BetSlip
                          key={`${selection.marketId}|${selection.runner}|${selection.side}|${selection.rate}`}
                          eventId={event.event_id}
                          selection={selection}
                          inplay={event.inplay}
                          onChange={onSlipChange}
                          onCancel={closeSlip}
                          onPlaced={onPlaced}
                      />
                  ),
              }
            : { slipRunner: null, slip: null }

    const common = { canBet: event.betting_open, onPick: setSelection, preview }

    return (
        <div className="event-page">
            <div className="event-bar">
                <span className="event-bar-name">{event.name}</span>
                <span className="event-bar-date">
                    {event.inplay && <span className="live-dot" title="In play" />}
                    {fmtEventDate(event.open_date)}
                </span>
            </div>
            {event.source === 'mock' && <DemoNote />}
            {!event.betting_open && <div className="error-box">Betting is paused: live odds are not available right now.</div>}
            {error && <div className="stale-note">Live update failed: {error}. Showing the last prices.</div>}
            <div className="event-layout">
                <div className="event-main">
                    <Scoreboard event={event} />
                    {match_odds && (
                        <MatchOdds market={match_odds} positions={event.positions[match_odds.id]} {...common} {...slipFor(match_odds.id)} />
                    )}
                    {bookmaker && (
                        <Bookmaker market={bookmaker} positions={event.positions[bookmaker.id]} {...common} {...slipFor(bookmaker.id)} />
                    )}
                    {fancy.length > 0 && <div className="coming-soon">Fancy / Session markets: coming soon</div>}
                    {!match_odds && !bookmaker && (
                        <div className="empty-panel">No markets are open for this match right now.</div>
                    )}
                </div>
                <div className="event-side">
                    <OpenBets bets={bets ?? []} />
                </div>
            </div>
        </div>
    )
}
