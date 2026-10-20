import { NavLink } from 'react-router-dom'
import { api } from '../lib/api'
import { usePolling } from '../lib/usePolling'

export const SPORT_ICONS: Record<number, string> = {
    4: '🏏',
    1: '⚽',
    2: '🎾',
    7: '🏇',
    4339: '🐕',
    2378961: '🗳️',
    99998: '🎰',
    99994: '🤼',
    99990: '📒',
    99991: '📈',
    99992: '💡',
    7522: '🏀',
    7511: '⚾',
}

export default function SportsSidebar({ overlay, onNavigate }: { overlay: boolean; onNavigate: () => void }) {
    const { data: sports } = usePolling(api.sports, 30000)
    const inplay = sports?.reduce((sum, s) => sum + s.inplay_count, 0) ?? 0

    const item = (to: string, icon: string, label: string, count: number) => (
        <NavLink key={to} to={to} className="sport-item" onClick={onNavigate}>
            <span className="sport-icon" aria-hidden="true">
                {icon}
            </span>
            <span className="sport-name">{label}</span>
            <span className="count-badge">{count}</span>
        </NavLink>
    )

    return (
        <aside className={`sports-sidebar${overlay ? ' overlay' : ''}`} aria-label="Sports">
            {item('/home', '⏱️', 'IN-PLAY', inplay)}
            {sports?.map((s) => item(`/sport/${s.id}`, SPORT_ICONS[s.id] ?? '🎯', s.name.toUpperCase(), s.event_count))}
        </aside>
    )
}
