import { useParams } from 'react-router-dom'
import { usePageTitle } from '../components/Layout'
import { EventSection } from '../components/odds'
import { api } from '../lib/api'
import { usePolling } from '../lib/usePolling'
import type { ExchangeEvent } from '../types'

const ODDS_REFRESH_MS = 2000

// "/home" lists everything in play, grouped by sport; "/sport/:id" one sport
export default function Home() {
    const { sportId } = useParams()
    const sid = sportId ? Number(sportId) : undefined
    const { data, error, loading } = usePolling(
        () => (sid ? api.events({ sport_id: sid }) : api.events({ inplay: true })),
        ODDS_REFRESH_MS,
        sid ?? 'inplay',
    )
    const { data: sports } = usePolling(api.sports, 60000)
    const sportName = sports?.find((s) => s.id === sid)?.name
    usePageTitle(sid ? (sportName ?? 'Sport') : 'Home')

    if (loading && !data) return <div className="loading">Loading markets…</div>
    if (error && !data) return <div className="error-box">{error}</div>
    const events = data ?? []

    if (sid) return <EventSection title={(sportName ?? 'Events').toUpperCase()} events={events} />

    // Sections follow the sidebar's sport order
    const order = new Map(sports?.map((s, i) => [s.id, i]))
    const groups = new Map<number, ExchangeEvent[]>()
    for (const e of events) groups.set(e.sport_id, [...(groups.get(e.sport_id) ?? []), e])
    if (!groups.size) return <EventSection title="IN-PLAY" events={[]} />
    return (
        <>
            {[...groups]
                .sort(([a], [b]) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
                .map(([id, list]) => (
                    <EventSection key={id} title={list[0].sport_name.toUpperCase()} events={list} />
                ))}
        </>
    )
}
