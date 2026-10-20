import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Ticker() {
    const [items, setItems] = useState<string[]>([])

    useEffect(() => {
        api.news()
            .then(setItems)
            .catch(() => setItems([]))
    }, [])

    const text = items.length ? `🏏 ${items.join('  🏆  ')} 🏆` : ''
    return (
        <div className="ticker" aria-label="Announcements">
            {text && (
                <div className="ticker-track">
                    <span>{text}</span>
                    {/* Second copy makes the loop seamless */}
                    <span aria-hidden="true">{text}</span>
                </div>
            )}
        </div>
    )
}
