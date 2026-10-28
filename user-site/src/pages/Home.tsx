import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DemoNote from '../components/DemoNote'
import { usePageTitle } from '../components/Layout'
import { api } from '../lib/api'
import { fmtEventDate, fmtPrice } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import type { ExchangeEvent, PriceSize } from '../types'

function Cell({ side, ps }: { side: 'back' | 'lay'; ps: PriceSize | null | undefined }) {
    return <span className={`ev-cell ${side}`}>{ps ? fmtPrice(ps.price) : '-'}</span>
}

function EventRow({ event }: { event: ExchangeEvent }) {
    const navigate = useNavigate()
    const { badges } = event
    return (
        <div className="ev-row" onClick={() => navigate(`/event/${event.event_id}`)}>
            <div className="ev-info">
                <Link to={`/event/${event.event_id}`} className="ev-name" onClick={(e) => e.stopPropagation()}>
                    {event.name}
                </Link>
                <span className="ev-date"> / {fmtEventDate(event.open_date)}</span>
                <span className="ev-icons">
                    {event.inplay && <span className="live-dot" title="In play" />}
                    {badges.tv && (
                        <span className="ev-icon" title="Live TV">
                            TV
                        </span>
                    )}
                    {badges.fancy && (
                        <span className="ev-icon" title="Fancy">
                            F
                        </span>
                    )}
                    {badges.bookmaker && (
                        <span className="ev-icon" title="Bookmaker">
                            BM
                        </span>
                    )}
                </span>
            </div>
            <div className="ev-odds">
                {[0, 1, 2].map((i) => (
                    <span className="ev-pair" key={i}>
                        <Cell side="back" ps={event.odds[i]?.back} />
                        <Cell side="lay" ps={event.odds[i]?.lay} />
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function Home() {
    const sportId = Number(useParams().sportId) || undefined
    const [inplayOnly, setInplayOnly] = useState(false)
    const { data, error, loading } = usePolling(
        () => api.events({ sport_id: sportId, inplay: inplayOnly }),
        3000,
        `${sportId}|${inplayOnly}`,
    )
    const { data: sports } = usePolling(api.sports, 60000)
    const sportName = sports?.find((s) => s.id === sportId)?.name
    usePageTitle(sportName ?? 'In-Play')

    const events = data ?? []
    return (
        <div className="page">
            <div className="page-head">
                <h1>{sportName ? sportName.toUpperCase() : 'IN-PLAY & UPCOMING'}</h1>
                <div className="chips" role="group" aria-label="Filter">
                    <button type="button" className={`chip${inplayOnly ? '' : ' on'}`} onClick={() => setInplayOnly(false)}>
                        All
                    </button>
                    <button type="button" className={`chip${inplayOnly ? ' on' : ''}`} onClick={() => setInplayOnly(true)}>
                        Live
                    </button>
                </div>
            </div>
            {events[0]?.source === 'mock' && <DemoNote />}
            <div className="ev-table">
                <div className="ev-head">
                    <span className="ev-info">Game</span>
                    <span className="ev-odds">
                        <span>1</span>
                        <span>X</span>
                        <span>2</span>
                    </span>
                </div>
                {events.map((e) => (
                    <EventRow key={e.event_id} event={e} />
                ))}
                {!events.length && (
                    <div className="empty-row">{loading ? 'Loading…' : error ? error : 'No matches right now'}</div>
                )}
            </div>
        </div>
    )
}
