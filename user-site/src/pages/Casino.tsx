import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { usePageTitle } from '../components/Layout'
import { api } from '../lib/api'
import { fmtAmount } from '../lib/format'
import type { CasinoLaunch, CasinoTable } from '../types'

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

// A real provider stream, as opposed to the built-in demo table screen
const isStreamUrl = (url: string) => /^https?:\/\//i.test(url)

export default function Casino() {
    usePageTitle('Live Casino')
    const { account, refresh } = useAuth()
    const [tables, setTables] = useState<CasinoTable[]>([])
    const [providers, setProviders] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProvider, setSelectedProvider] = useState('ALL')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const [activeGame, setActiveGame] = useState<CasinoTable | null>(null)
    const [launch, setLaunch] = useState<CasinoLaunch | null>(null)
    const [launching, setLaunching] = useState(false)
    const [launchError, setLaunchError] = useState<string | null>(null)

    // Which providers exist depends on the catalog the backend is serving, so
    // the filter bar is built from it rather than hard-coded.
    useEffect(() => {
        let cancelled = false
        api.casinoProviders()
            .then((list) => {
                if (!cancelled) setProviders(list)
            })
            .catch(() => undefined)
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const data = await api.casinoTables({
                    provider: selectedProvider !== 'ALL' ? selectedProvider : undefined,
                    category: selectedCategory !== 'all' ? selectedCategory : undefined,
                })
                if (!cancelled) {
                    setTables(data)
                    setError(null)
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the casino tables')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [selectedProvider, selectedCategory])

    const openTable = useCallback(async (table: CasinoTable) => {
        setActiveGame(table)
        setLaunch(null)
        setLaunchError(null)
        setLaunching(true)
        try {
            setLaunch(await api.casinoLaunch(table.id))
        } catch (e) {
            setLaunchError(e instanceof Error ? e.message : 'Could not open this table')
        } finally {
            setLaunching(false)
        }
    }, [])

    const closeTable = useCallback(() => {
        setActiveGame(null)
        setLaunch(null)
        setLaunchError(null)
        // Bets placed at the table move the balance through the wallet API
        refresh().catch(() => undefined)
    }, [refresh])

    const providerChips = ['ALL', ...providers]

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
            {providerChips.length > 1 && (
                <div className="casino-providers-bar">
                    <span className="filter-label">PROVIDER:</span>
                    <div className="provider-chips">
                        {providerChips.map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={`provider-chip ${selectedProvider === p ? 'active' : ''}`}
                                onClick={() => setSelectedProvider(p)}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                    <div className="casino-card" key={table.id} onClick={() => openTable(table)}>
                        <div className="casino-card-media">
                            {table.image ? (
                                <img src={table.image} alt={table.name} loading="lazy" />
                            ) : (
                                <div className="casino-card-noimg">{table.name}</div>
                            )}
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
                                {table.players_count > 0 && (
                                    <span className="table-players">🔥 {table.players_count}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && tables.length === 0 && (
                <div className="loading-state">Loading live casino tables…</div>
            )}
            {!loading && error && <div className="loading-state">{error}</div>}
            {!loading && !error && tables.length === 0 && (
                <div className="loading-state">No live tables are available right now.</div>
            )}

            {/* Live Game Launcher Modal */}
            {activeGame && (
                <div className="game-modal-backdrop" onClick={closeTable}>
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
                                <button type="button" className="gm-close-btn" onClick={closeTable}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="game-screen-wrapper">
                            {launching && <div className="loading-state">Opening the table…</div>}

                            {!launching && launchError && (
                                <div className="game-demo-feed">
                                    <div className="game-center-action">
                                        <h3>Table unavailable</h3>
                                        <p>{launchError}</p>
                                    </div>
                                </div>
                            )}

                            {/* The provider's own game, served in an iframe */}
                            {!launching && launch && isStreamUrl(launch.launch_url) && (
                                <iframe
                                    className="game-stream-frame"
                                    src={launch.launch_url}
                                    title={activeGame.name}
                                    allow="autoplay; fullscreen; encrypted-media"
                                    allowFullScreen
                                />
                            )}

                            {/* No provider stream configured yet: the demo table screen */}
                            {!launching && launch && !isStreamUrl(launch.launch_url) && (
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
                                        Demo table. Set CASINO_PROVIDER=live on the backend to serve the
                                        provider's own stream here.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
