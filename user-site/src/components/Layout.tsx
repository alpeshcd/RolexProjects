import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Header from './Header'

type ToastKind = 'success' | 'error'

interface LayoutApi {
    setTitle: (title: string) => void
    toast: (message: string, kind?: ToastKind) => void
    selectedCompetition: string | null
    setSelectedCompetition: (comp: string | null) => void
    mobileSidebarOpen: boolean
    setMobileSidebarOpen: (open: boolean) => void
    toggleMobileSidebar: () => void
}

const LayoutContext = createContext<LayoutApi | null>(null)

export function useLayout(): LayoutApi {
    const ctx = useContext(LayoutContext)
    if (!ctx) throw new Error('Layout hooks must be used inside Layout')
    return ctx
}

export function usePageTitle(title: string) {
    const { setTitle } = useLayout()
    useEffect(() => setTitle(title), [title, setTitle])
}

export function useToast() {
    return useLayout().toast
}

// Complete list of top navigation sports matching Mastan99 / bet.mastanx.com
export const TOP_NAV_SPORTS = [
    { id: 0, key: 'home', name: 'HOME', path: '/home' },
    { id: 4, key: 'cricket', name: 'CRICKET', path: '/sport/4' },
    { id: 1, key: 'football', name: 'FOOTBALL', path: '/sport/1' },
    { id: 2, key: 'tennis', name: 'TENNIS', path: '/sport/2' },
    { id: 99911, key: 'fantasy11', name: 'FANTASY 11', path: '/sport/4?fantasy=true', highlight: true },
    { id: 99912, key: 'cockfight', name: 'COCK FIGHT', path: '/sport/99912' },
    { id: 99998, key: 'casino', name: 'CASINO', path: '/casino' },
    { id: 99990, key: 'sportsbook', name: 'SPORTS BOOK', path: '/sport/99990' },
    { id: 7, key: 'horseracing', name: 'HORSE RACING', path: '/sport/7' },
    { id: 4339, key: 'greyhound', name: 'GREYHOUND RACING', path: '/sport/4339' },
    { id: 99999, key: 'other', name: 'OTHER', path: '/sport/99999' },
    { id: 99991, key: 'binary', name: 'BINARY', path: '/sport/99991' },
    { id: 99994, key: 'kabaddi', name: 'KABADDI', path: '/sport/99994' },
    { id: 2378961, key: 'politics', name: 'POLITICS', path: '/sport/2378961' },
    { id: 7522, key: 'basketball', name: 'BASKETBALL', path: '/sport/7522' },
    { id: 7511, key: 'baseball', name: 'BASEBALL', path: '/sport/7511' },
    { id: 99995, key: 'tabletennis', name: 'TABLE TENNIS', path: '/sport/99995' },
    { id: 99996, key: 'volleyball', name: 'VOLLEYBALL', path: '/sport/99996' },
    { id: 99997, key: 'icehockey', name: 'ICE HOCKEY', path: '/sport/99997' },
    { id: 99988, key: 'rugby', name: 'RUGBY', path: '/sport/99988' },
    { id: 99987, key: 'mma', name: 'MIXED MARTIAL ARTS', path: '/sport/99987' },
    { id: 99986, key: 'darts', name: 'DARTS', path: '/sport/99986' },
    { id: 99985, key: 'futsal', name: 'FUTSAL', path: '/sport/99985' },
]

// All sidebar sports with hierarchies matching screenshot 2
export const SIDEBAR_SPORTS_TREE = [
    {
        id: 4,
        name: 'Cricket',
        competitions: [
            'Others',
            'India / Ranji Trophy',
            'Pakistan / Presidents Trophy',
            'Test Matches',
            'International / ICC Cricket World Cup, Challenge League',
            'Womens One Day Internationals',
            'Simulated Reality League / Caribbean Premier League SRL',
            'Simulated Reality League / T20 International SRL',
            'Simulated Reality League / Pakistan Super League SRL',
            'Simulated Reality League / Premier League SRL',
            'Nepal Premier League',
            'Simulated Reality League / Big Bash League SRL',
            'Global T20 Canada',
            'South Africa T20 Challenge',
            'Simulated Reality League / SA T20 League SRL',
            'Simulated Reality League / Super Smash SRL',
            'Ford Trophy',
            'WBBL',
            'One Day Internationals',
            'International Twenty20 Matches',
        ],
    },
    {
        id: 1,
        name: 'Football',
        competitions: ['Premier League', 'Champions League', 'La Liga', 'Serie A', 'Bundesliga', 'Indian Super League'],
    },
    {
        id: 2,
        name: 'Tennis',
        competitions: ['ATP Tour', 'WTA Tour', 'Challenger', 'ITF Men', 'ITF Women'],
    },
    { id: 7, name: 'Horse Racing', competitions: [] },
    { id: 4339, name: 'Greyhound Racing', competitions: [] },
    { id: 99991, name: 'Binary', competitions: [] },
    { id: 7522, name: 'Basketball', competitions: ['NBA', 'EuroLeague', 'CBA'] },
    { id: 7511, name: 'Baseball', competitions: ['MLB', 'NPB'] },
    { id: 99995, name: 'Table Tennis', competitions: ['WTT', 'TT Cup'] },
    { id: 99996, name: 'Volleyball', competitions: ['Nations League', 'SuperLega'] },
    { id: 99997, name: 'Ice Hockey', competitions: ['NHL', 'KHL'] },
    { id: 99986, name: 'Darts', competitions: ['PDC World Championship'] },
    { id: 99985, name: 'Futsal', competitions: [] },
]

export default function Layout() {
    const { portal } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [title, setTitle] = useState('')
    const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
    const [expandedSports, setExpandedSports] = useState<Record<number, boolean>>({ 4: true })
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileSidebarOpen(false)
    }, [location.pathname, location.search])

    useEffect(() => {
        document.title = [title, portal?.brand_name || 'MASTAN99'].filter(Boolean).join(' | ')
    }, [title, portal?.brand_name])

    const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([])
    const toast = useCallback((message: string, kind: ToastKind = 'success') => {
        const id = Date.now() + Math.random()
        setToasts((t) => [...t, { id, message, kind }])
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
    }, [])

    const toggleSportExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedSports((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const handleCompetitionClick = (sportId: number, compName: string) => {
        setSelectedCompetition(compName)
        setMobileSidebarOpen(false)
        navigate(`/sport/${sportId}?competition=${encodeURIComponent(compName)}`)
    }

    const toggleMobileSidebar = useCallback(() => {
        setMobileSidebarOpen((prev) => !prev)
    }, [])

    const layoutApi = useMemo(
        () => ({
            setTitle,
            toast,
            selectedCompetition,
            setSelectedCompetition,
            mobileSidebarOpen,
            setMobileSidebarOpen,
            toggleMobileSidebar,
        }),
        [toast, selectedCompetition, mobileSidebarOpen, toggleMobileSidebar],
    )

    return (
        <LayoutContext.Provider value={layoutApi}>
            <Header />

            {/* Top Teal Sports Nav Bar */}
            <nav className="top-sports-nav" aria-label="Main sports navigation">
                <div className="top-sports-nav-inner">
                    {TOP_NAV_SPORTS.map((item) => (
                        <NavLink
                            key={item.key}
                            to={item.path}
                            className={({ isActive }) =>
                                `sports-nav-link ${isActive && !location.search.includes('competition') ? 'active' : ''} ${item.highlight ? 'nav-highlight-orange' : ''}`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="shell">
                {/* Mobile Drawer Backdrop */}
                {mobileSidebarOpen && (
                    <div
                        className="mobile-sidebar-backdrop"
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Left Sidebar (Desktop Static + Mobile Off-canvas Drawer) */}
                <aside
                    className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}
                    aria-label="Sports directory"
                >
                    {/* Header 1: Others > */}
                    <div className="sidebar-header-bar others-bar">
                        <span>Others</span>
                        <span className="arrow-right">›</span>
                    </div>

                    {/* Header 2: All Sports v */}
                    <div
                        className="sidebar-header-bar all-sports-bar"
                        onClick={() => setSidebarCollapsed((c) => !c)}
                    >
                        <span>All Sports</span>
                        <span className="arrow-down">{sidebarCollapsed ? '›' : 'ˇ'}</span>
                    </div>

                    {/* Hierarchical Sports Tree */}
                    {!sidebarCollapsed && (
                        <div className="sports-tree">
                            {SIDEBAR_SPORTS_TREE.map((sport) => {
                                const isExpanded = !!expandedSports[sport.id]
                                const hasChildren = sport.competitions && sport.competitions.length > 0

                                return (
                                    <div key={sport.id} className="tree-node">
                                        <div
                                            className="tree-row"
                                            onClick={() => {
                                                setSelectedCompetition(null)
                                                setMobileSidebarOpen(false)
                                                navigate(sport.id === 0 ? '/home' : `/sport/${sport.id}`)
                                            }}
                                        >
                                            <span
                                                className="tree-toggle-btn"
                                                onClick={(e) => hasChildren && toggleSportExpand(sport.id, e)}
                                            >
                                                {hasChildren ? (isExpanded ? '−' : '+') : '•'}
                                            </span>
                                            <span className="tree-sport-name">{sport.name}</span>
                                        </div>

                                        {/* Sub-competitions when expanded */}
                                        {hasChildren && isExpanded && (
                                            <div className="tree-children">
                                                {sport.competitions.map((comp) => {
                                                    const isSelected = selectedCompetition === comp
                                                    return (
                                                        <div
                                                            key={comp}
                                                            className={`tree-child-row ${isSelected ? 'active' : ''}`}
                                                            onClick={() => handleCompetitionClick(sport.id, comp)}
                                                        >
                                                            <span className="tree-child-icon">+</span>
                                                            <span className="tree-child-name" title={comp}>
                                                                {comp}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Bottom Green SECURE Shield Badge matching Screenshot 2 */}
                    <div className="sidebar-secure-badge">
                        <div className="secure-badge-box">
                            <svg className="secure-shield-icon" viewBox="0 0 36 36" width="30" height="30">
                                <path
                                    d="M18 2 L32 8 V18 C32 26 25 32 18 35 C11 32 4 26 4 18 V8 Z"
                                    fill="#44b029"
                                    stroke="#34941d"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M12 18 L16 22 L24 13"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="secure-text">SECURE</span>
                        </div>
                        <div className="sidebar-brown-footer" />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="content">
                    <Outlet />
                </main>
            </div>

            {/* Toasts */}
            <div className="toasts" role="status" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.kind}`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </LayoutContext.Provider>
    )
}
