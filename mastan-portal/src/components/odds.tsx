import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtAmount, fmtDateTime, fmtPrice } from '../lib/format'
import type { Badges, ExchangeEvent, PriceSize } from '../types'

// True for a moment after `value` changes, to flash a moved price
function useFlash(value: unknown): boolean {
    const prev = useRef(value)
    const [flash, setFlash] = useState(false)
    useEffect(() => {
        if (prev.current === value) return
        const changed = prev.current !== undefined && value !== undefined
        prev.current = value
        if (!changed) return
        setFlash(true)
        const t = window.setTimeout(() => setFlash(false), 600)
        return () => window.clearTimeout(t)
    }, [value])
    return flash
}

export function PriceBox({ side, ps }: { side: 'back' | 'lay'; ps: PriceSize | null | undefined }) {
    const flash = useFlash(ps?.price)
    return (
        <div className={`price ${side}${flash ? ' flash' : ''}`}>
            <span className="p">{ps ? fmtPrice(ps.price) : '-'}</span>
            <span className="s">{ps ? fmtAmount(ps.size) : '-'}</span>
        </div>
    )
}

function TvIcon() {
    return (
        <svg className="tv-icon" viewBox="0 0 24 24" aria-label="Live TV" role="img">
            <rect x="2" y="4" width="20" height="13" rx="2" fill="#1ea0e6" />
            <rect x="4" y="6" width="16" height="9" rx="1" fill="#bfe8ff" />
            <rect x="8" y="18.5" width="8" height="2" rx="1" fill="#1ea0e6" />
        </svg>
    )
}

export function EventBadges({ badges, inplay }: { badges: Badges; inplay: boolean }) {
    return (
        <span className="badges">
            {badges.fancy && (
                <span className="badge-circle" title="Fancy">
                    F
                </span>
            )}
            {badges.bookmaker && (
                <span className="badge-circle" title="Bookmaker">
                    B
                </span>
            )}
            {badges.premium && (
                <span className="badge-square" title="Premium">
                    P
                </span>
            )}
            {badges.tv && <TvIcon />}
            {inplay && <span className="live-dot" title="In play" />}
        </span>
    )
}

export function EventRow({ event }: { event: ExchangeEvent }) {
    return (
        <div className="event-row">
            <div className="event-info">
                <div>
                    <Link to={`/event/${event.event_id}`} className="event-name">
                        {event.name}
                    </Link>{' '}
                    <span className="event-date">({fmtDateTime(event.open_date)})</span>
                </div>
                <div className="event-meta">
                    <span className="event-comp">({event.competition})</span>
                    <EventBadges badges={event.badges} inplay={event.inplay} />
                </div>
                <div className="event-exposure" title="Exposure">
                    {fmtAmount(event.exposure)}
                </div>
            </div>
            <div className="odds-grid" aria-label="1 / X / 2 back and lay">
                {event.odds.map((slot, i) => (
                    <div className="odds-pair" key={i}>
                        <PriceBox side="back" ps={slot?.back} />
                        <PriceBox side="lay" ps={slot?.lay} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function EventSection({ title, events }: { title: string; events: ExchangeEvent[] }) {
    return (
        <section className="event-section">
            <div className="section-head">
                <span>{title}</span>
                <span className="odds-head" aria-hidden="true">
                    <span>1</span>
                    <span>X</span>
                    <span>2</span>
                </span>
            </div>
            {events.length ? (
                events.map((e) => <EventRow key={e.event_id} event={e} />)
            ) : (
                <div className="empty-row">No events right now</div>
            )}
        </section>
    )
}
