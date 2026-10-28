import { useNavigate } from 'react-router-dom'
import type { ExchangeEvent } from '../types'

interface Props {
    events: ExchangeEvent[]
}

export default function MatchTicker({ events }: Props) {
    const navigate = useNavigate()

    if (!events || events.length === 0) return null

    // Pick live and upcoming featured events
    const featured = events.slice(0, 15)

    return (
        <div className="match-ticker-container" aria-label="Live & Featured Matches">
            <div className="match-ticker-scroll">
                {featured.map((ev) => {
                    const dateObj = new Date(ev.open_date)
                    const dateFormatted = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`

                    const sportIcon = ev.sport_id === 1 ? '⚽' : ev.sport_id === 2 ? '🎾' : '🏏'

                    return (
                        <div
                            key={ev.event_id}
                            className="ticker-card"
                            onClick={() => navigate(`/event/${ev.event_id}`)}
                            title={`${ev.name} - ${dateFormatted}`}
                        >
                            <span className="ticker-icon">{sportIcon}</span>
                            <div className="ticker-info">
                                <span className="ticker-name">{ev.name}</span>
                                <span className="ticker-date">{dateFormatted}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
