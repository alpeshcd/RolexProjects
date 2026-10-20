import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import BetsPanel from '../components/BetsPanel'
import { usePageTitle } from '../components/Layout'
import { BookmakerTable, FancyTable, LastDigitTable, MatchOddsTable } from '../components/markets'
import Scoreboard from '../components/Scoreboard'
import { api } from '../lib/api'
import { usePins } from '../lib/pins'
import { usePolling } from '../lib/usePolling'

const MARKET_REFRESH_MS = 1000

export default function EventPage() {
    const eventId = Number(useParams().eventId)
    const { data: event, error } = usePolling(() => api.event(eventId), MARKET_REFRESH_MS, eventId)
    const { pins, toggle } = usePins()
    const betsRef = useRef<HTMLDivElement>(null)
    usePageTitle(event?.name ?? 'Match')

    if (!event) {
        return error ? (
            <div className="error-box">
                {error}. <Link to="/home">Back to In-Play</Link>
            </div>
        ) : (
            <div className="loading">Loading match…</div>
        )
    }

    const { match_odds, bookmaker, fancy, last_digit } = event.markets
    const pinned = pins.includes(event.event_id)
    const hasMarkets = match_odds || bookmaker || fancy.length || last_digit

    return (
        <div className="event-page">
            <div className="event-bar">
                <button
                    type="button"
                    className={`pin-btn${pinned ? ' on' : ''}`}
                    onClick={() => toggle(event.event_id)}
                    aria-pressed={pinned}
                    title={pinned ? 'Remove from Multi Market' : 'Add to Multi Market'}
                >
                    {pinned ? '★' : '☆'}
                </button>
                <span className="event-bar-name">{event.name.toUpperCase()}</span>
                <button
                    type="button"
                    className="bets-btn"
                    onClick={() => betsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    BETS
                </button>
            </div>
            {error && <div className="stale-note">Live update failed: {error}. Showing the last prices.</div>}
            <div className="event-layout">
                <div className="event-main">
                    <Scoreboard event={event} />
                    {match_odds && <MatchOddsTable market={match_odds} />}
                    {bookmaker && <BookmakerTable market={bookmaker} />}
                    {fancy.length > 0 && <FancyTable lines={fancy} />}
                    {last_digit && <LastDigitTable market={last_digit} />}
                    {!hasMarkets && <div className="empty-panel">No markets are open for this event right now.</div>}
                </div>
                <div className="event-side" ref={betsRef}>
                    <BetsPanel eventId={event.event_id} />
                </div>
            </div>
        </div>
    )
}
