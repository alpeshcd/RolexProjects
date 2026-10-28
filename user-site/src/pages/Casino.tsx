import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { usePageTitle } from '../components/Layout'
import { fmtAmount } from '../lib/format'

interface CasinoTable {
    id: string
    name: string
    category: string
    provider: string
    image: string
    min_bet: number
    max_bet: number
    players_count: number
    is_active: boolean
}

const CATEGORIES = [
    { id: 'all', label: 'ALL GAMES' },
    { id: 'teen_patti', label: 'TEEN PATTI' },
    { id: 'roulette', label: 'ROULETTE' },
    { id: 'andar_bahar', label: 'ANDAR BAHAR' },
    { id: 'dragon_tiger', label: 'DRAGON TIGER' },
    { id: 'baccarat', label: 'BACCARAT' },
    { id: 'blackjack', label: 'BLACKJACK' },
    { id: 'poker', label: 'POKER' },
]

const PROVIDERS = ['ALL', 'AURA', 'EVOLUTION', 'EZUGI', 'SUPER SPADE']

export default function Casino() {
    usePageTitle('Live Casino')
    const { account } = useAuth()
    const [tables, setTables] = useState<CasinoTable[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProvider, setSelectedProvider] = useState('ALL')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [activeGame, setActiveGame] = useState<CasinoTable | null>(null)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (selectedProvider !== 'ALL') params.set('provider', selectedProvider)
                if (selectedCategory !== 'all') params.set('category', selectedCategory)
                const res = await fetch(`/api/v1/player/casino/tables?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    if (!cancelled) setTables(data)
                }
            } catch {
                // Ignore or keep previous
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [selectedProvider, selectedCategory])

    return (
        <div className="casino-page">
            {/* Casino Header Banner */}
            <div className="casino-hero">
                <div className="casino-hero-content">
                    <h1>LIVE DEALER CASINO</h1>
                    <p>Real-time HD Live Tables • Instant Settlement • 24/7 Dealers</p>
                </div>
            </div>

            {/* Providers Filter Bar */}
            <div className="casino-providers-bar">
                <span className="filter-label">PROVIDER:</span>
                <div className="provider-chips">
                    {PROVIDERS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            className={`provider-chip ${selectedProvider === p ? 'active' : ''}`}
                            onClick={() => setSelectedProvider(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories Sub-nav Bar */}
            <div className="casino-categories-bar">
                <div className="categories-scroll">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Casino Games Grid */}
            <div className="casino-grid">
                {tables.map((table) => (
                    <div className="casino-card" key={table.id} onClick={() => setActiveGame(table)}>
                        <div className="casino-card-media">
                            <img src={table.image} alt={table.name} loading="lazy" />
                            <div className="casino-provider-badge">{table.provider}</div>
                            <div className="casino-live-badge">
                                <span className="live-dot" /> LIVE
                            </div>
                            <div className="casino-hover-play">
                                <button type="button" className="btn-play-table">
                                    PLAY NOW
                                </button>
                            </div>
                        </div>

                        <div className="casino-card-info">
                            <span className="table-title">{table.name}</span>
                            <div className="table-meta">
                                <span className="table-limits">
                                    Min: {fmtAmount(table.min_bet)} - Max: {fmtAmount(table.max_bet)}
                                </span>
                                <span className="table-players">🔥 {table.players_count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && tables.length === 0 && (
                <div className="loading-state">Loading live casino tables…</div>
            )}

            {/* Live Game Launcher Modal */}
            {activeGame && (
                <div className="game-modal-backdrop" onClick={() => setActiveGame(null)}>
                    <div className="game-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="game-modal-header">
                            <div className="gm-left">
                                <span className="gm-title">{activeGame.name}</span>
                                <span className="gm-provider">{activeGame.provider}</span>
                            </div>
                            <div className="gm-right">
                                {account && (
                                    <span className="gm-balance">
                                        Bal: <b>{fmtAmount(account.available)}</b>
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="gm-close-btn"
                                    onClick={() => setActiveGame(null)}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="game-screen-wrapper">
                            <div className="game-demo-feed">
                                <div className="game-live-header">
                                    <span className="feed-badge">● LIVE DEALER FEED</span>
                                    <span>TABLE #{activeGame.id}</span>
                                </div>
                                <div className="game-center-action">
                                    <div className="game-dealer-avatar">
                                        <img src={activeGame.image} alt="Dealer" />
                                    </div>
                                    <h3>{activeGame.name}</h3>
                                    <p>Connected to {activeGame.provider} Live Studio</p>
                                    <div className="game-status-pill">BETTING OPEN</div>
                                </div>
                                <div className="game-quick-chips">
                                    {[100, 500, 1000, 5000, 25000].map((chip) => (
                                        <button type="button" key={chip} className="quick-chip-btn">
                                            ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                                        </button>
                                    ))}
                                </div>
                                <div className="game-footer-note">
                                    Ready for client live stream iframe integration.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
