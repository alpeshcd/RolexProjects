import { useState, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usePageTitle, useLayout } from '../components/Layout'
import MatchTicker from '../components/MatchTicker'
import { api } from '../lib/api'
import { fmtEventDate, fmtPrice } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import type { ExchangeEvent, PriceSize } from '../types'

// Sub tabs matching Screenshot 1
const SUB_TABS = [
    { id: 'inplay', label: 'INPLAY' },
    { id: 4, label: 'CRICKET' },
    { id: 1, label: 'FOOTBALL' },
    { id: 2, label: 'TENNIS' },
    { id: 'fantasy', label: 'FANTASY 11' },
    { id: 'cockfight', label: 'COCK FIGHT' },
    { id: 'casino', label: 'CASINO' },
    { id: 7, label: 'HORSE RACING' },
    { id: 4339, label: 'GREYHOUND RACING' },
    { id: 'other', label: 'OTHER' },
    { id: 99991, label: 'BINARY' },
    { id: 99994, label: 'KABADDI' },
    { id: 2378961, label: 'POLITICS' },
    { id: 7522, label: 'BASKETBALL' },
    { id: 7511, label: 'BASEBALL' },
    { id: 'tabletennis', label: 'TABLE TENNIS' },
]

function OddsCell({
    side,
    ps,
    eventId,
}: {
    side: 'back' | 'lay'
    ps: PriceSize | null | undefined
    eventId: number
}) {
    const navigate = useNavigate()
    const hasOdds = ps && ps.price > 0

    return (
        <span
            className={`ev-cell ${side} ${hasOdds ? 'clickable' : 'empty'}`}
            onClick={(e) => {
                e.stopPropagation()
                navigate(`/event/${eventId}`)
            }}
        >
            {hasOdds ? fmtPrice(ps.price) : '-'}
        </span>
    )
}

function EventRow({ event }: { event: ExchangeEvent }) {
    const navigate = useNavigate()
    const { badges } = event

    // Sport / event icon
    const isSRL = event.name.includes('SRL') || event.competition.includes('SRL')
    const isT10 = event.name.includes('T10') || event.name.includes('WWE') || event.name.includes('VS')
    let sportIcon = '🏏'
    if (event.sport_id === 1) sportIcon = '⚽'
    else if (event.sport_id === 2) sportIcon = '🎾'
    else if (isSRL) sportIcon = '🎮'
    else if (isT10) sportIcon = '🥊'

    return (
        <div className="ev-row" onClick={() => navigate(`/event/${event.event_id}`)}>
            {/* Left game column */}
            <div className="ev-info">
                <span className="ev-sport-icon">{sportIcon}</span>
                <Link
                    to={`/event/${event.event_id}`}
                    className="ev-name"
                    onClick={(e) => e.stopPropagation()}
                >
                    {event.name}
                </Link>
                <span className="ev-date"> / {fmtEventDate(event.open_date)}</span>

                {/* Status Badges on right side of game cell */}
                <span className="ev-icons">
                    {event.inplay && <span className="live-dot" title="In Play (Live)" />}
                    {badges.tv && (
                        <span className="ev-icon ev-icon-tv" title="Live Video Available">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                            </svg>
                        </span>
                    )}
                    {badges.fancy && (
                        <span className="ev-badge-text badge-f" title="Fancy Market Open">
                            F
                        </span>
                    )}
                    {badges.bookmaker && (
                        <span className="ev-badge-text badge-bm" title="Bookmaker Available">
                            BM
                        </span>
                    )}
                    {isSRL && (
                        <span className="ev-badge-text badge-game" title="Simulated Reality">
                            🎮
                        </span>
                    )}
                    <span className="ev-pin-icon" title="Pin to top">
                        📌
                    </span>
                </span>
            </div>

            {/* 6 Odds Columns: 1 Back, 1 Lay, X Back, X Lay, 2 Back, 2 Lay */}
            <div className="ev-odds">
                <span className="ev-pair">
                    <OddsCell side="back" ps={event.odds[0]?.back} eventId={event.event_id} />
                    <OddsCell side="lay" ps={event.odds[0]?.lay} eventId={event.event_id} />
                </span>
                <span className="ev-pair">
                    <OddsCell side="back" ps={event.odds[1]?.back} eventId={event.event_id} />
                    <OddsCell side="lay" ps={event.odds[1]?.lay} eventId={event.event_id} />
                </span>
                <span className="ev-pair">
                    <OddsCell side="back" ps={event.odds[2]?.back} eventId={event.event_id} />
                    <OddsCell side="lay" ps={event.odds[2]?.lay} eventId={event.event_id} />
                </span>
            </div>
        </div>
    )
}

export default function Home() {
    const params = useParams()
    const [searchParams] = useSearchParams()
    const { selectedCompetition } = useLayout()
    const routeSportId = Number(params.sportId) || undefined
    const compParam = searchParams.get('competition') || selectedCompetition

    const [activeTab, setActiveTab] = useState<string | number>(routeSportId || 'inplay')
    const [filterLive, setFilterLive] = useState(false)
    const [filterVirtual, setFilterVirtual] = useState(false)
    const [filterPremium, setFilterPremium] = useState(false)
    const [viewBy, setViewBy] = useState<'TIME' | 'COMPETITION'>('TIME')

    const effectiveSportId =
        typeof activeTab === 'number'
            ? activeTab
            : routeSportId
            ? routeSportId
            : undefined

    const inplayOnly = activeTab === 'inplay' || filterLive

    const { data: allEvents, error, loading } = usePolling(
        () => api.events({ sport_id: effectiveSportId, inplay: inplayOnly }),
        3000,
        `${effectiveSportId}|${inplayOnly}`,
    )

    const { data: sports } = usePolling(api.sports, 60000)
    const sportName = sports?.find((s) => s.id === routeSportId)?.name
    usePageTitle(sportName || 'Exchange Matches')

    // Filter events by competition or search
    const filteredEvents = useMemo(() => {
        let list = allEvents ?? []
        if (compParam) {
            list = list.filter((e) =>
                e.competition.toLowerCase().includes(compParam.toLowerCase()) ||
                compParam.toLowerCase().includes(e.competition.toLowerCase())
            )
        }
        if (filterVirtual) {
            list = list.filter((e) => e.name.includes('SRL') || e.competition.includes('SRL'))
        }
        if (filterPremium) {
            list = list.filter((e) => e.badges.premium)
        }
        return list
    }, [allEvents, compParam, filterVirtual, filterPremium])

    return (
        <div className="home-page">
            {/* Top Match Ticker Horizontal Carousel */}
            <MatchTicker events={allEvents ?? []} />

            {/* Sub-Navigation Bar matching Screenshot 1 & 2 */}
            <div className="sub-nav-bar">
                <div className="sub-nav-tabs">
                    {SUB_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`sub-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right controls: -LIVE, -VIRTUAL, -PREMIUM, View by: TIME */}
                <div className="sub-nav-controls">
                    <button
                        type="button"
                        className={`filter-pill-btn ${filterLive ? 'active' : ''}`}
                        onClick={() => setFilterLive((f) => !f)}
                    >
                        -LIVE
                    </button>
                    <button
                        type="button"
                        className={`filter-pill-btn ${filterVirtual ? 'active' : ''}`}
                        onClick={() => setFilterVirtual((f) => !f)}
                    >
                        -VIRTUAL
                    </button>
                    <button
                        type="button"
                        className={`filter-pill-btn ${filterPremium ? 'active' : ''}`}
                        onClick={() => setFilterPremium((f) => !f)}
                    >
                        -PREMIUM
                    </button>
                    <div className="view-by-dropdown">
                        <span>View by:</span>
                        <select
                            value={viewBy}
                            onChange={(e) => setViewBy(e.target.value as 'TIME' | 'COMPETITION')}
                        >
                            <option value="TIME">TIME</option>
                            <option value="COMPETITION">COMPETITION</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Active tournament filter notice if applied from sidebar */}
            {compParam && (
                <div className="filter-notice">
                    <span>Filtered by tournament: <b>{compParam}</b></span>
                    <button
                        type="button"
                        onClick={() => window.location.href = routeSportId ? `/sport/${routeSportId}` : '/home'}
                    >
                        Show All
                    </button>
                </div>
            )}

            {/* Main Matches Table */}
            <div className="ev-table-container">
                <div className="ev-table-head">
                    <span className="ev-head-game">Game</span>
                    <span className="ev-head-odds">
                        <span className="ev-head-col">1</span>
                        <span className="ev-head-col">X</span>
                        <span className="ev-head-col">2</span>
                    </span>
                </div>

                <div className="ev-table-body">
                    {filteredEvents.map((e) => (
                        <EventRow key={e.event_id} event={e} />
                    ))}

                    {!filteredEvents.length && (
                        <div className="ev-empty-state">
                            {loading ? 'Loading live matches…' : error ? error : 'No matches available right now'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
