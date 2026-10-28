import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../components/Layout'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime } from '../lib/format'
import { usePolling } from '../lib/usePolling'

const STATUS_LABEL = { open: 'Open', won: 'Won', lost: 'Lost', void: 'Void' }

export default function MyBets() {
    usePageTitle('My Bets')
    const [tab, setTab] = useState<'open' | 'settled'>('open')
    const { data, error, loading } = usePolling(() => api.bets({ status: tab }), 10000, tab)
    const bets = data ?? []
    const open = tab === 'open'

    return (
        <div className="page">
            <div className="page-head">
                <h1>MY BETS</h1>
                <div className="chips" role="tablist">
                    <button type="button" role="tab" aria-selected={open} className={`chip${open ? ' on' : ''}`} onClick={() => setTab('open')}>
                        Open
                    </button>
                    <button type="button" role="tab" aria-selected={!open} className={`chip${open ? '' : ' on'}`} onClick={() => setTab('settled')}>
                        Settled
                    </button>
                </div>
            </div>
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Match</th>
                            <th>Market</th>
                            <th>Runner</th>
                            <th>Type</th>
                            <th className="num">Rate</th>
                            <th className="num">Stake</th>
                            <th className="num">{open ? 'Profit / Liability' : 'Profit/Loss'}</th>
                            {!open && <th>Result</th>}
                            <th>Placed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bets.map((b) => (
                            <tr key={b.id} className={`row-${b.side}`}>
                                <td>
                                    <Link to={`/event/${b.event_id}`}>{b.event_name}</Link>
                                    {b.demo_odds && <small className="demo-tag">demo odds</small>}
                                </td>
                                <td>{b.market_name}</td>
                                <td>{b.runner}</td>
                                <td className="cap">{b.side}</td>
                                <td className="num">{b.rate}</td>
                                <td className="num">{fmtAmount(b.stake)}</td>
                                <td className={`num ${open ? (b.side === 'back' ? 'pos' : 'neg') : b.pl < 0 ? 'neg' : 'pos'}`}>
                                    {open ? fmtAmount(b.side === 'back' ? b.pl : b.liability) : fmtAmount(b.pl)}
                                </td>
                                {!open && <td>{STATUS_LABEL[b.status]}</td>}
                                <td className="nowrap">{fmtDateTime(b.placed_at)}</td>
                            </tr>
                        ))}
                        {!bets.length && (
                            <tr>
                                <td colSpan={open ? 8 : 9} className="empty-cell">
                                    {loading ? 'Loading…' : error ?? (open ? 'No open bets' : 'No settled bets yet')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
