import { Link, useLocation } from 'react-router-dom'
import { usePageTitle } from '../components/Layout'
import { EventSection } from '../components/odds'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime, fmtPrice } from '../lib/format'
import { usePins } from '../lib/pins'
import { usePolling } from '../lib/usePolling'
import { PENDING_REPORTS } from '../menus'

export function MultiMarket() {
    usePageTitle('Multi Market')
    const { pins } = usePins()
    const { data } = usePolling(() => api.events({}), 2000)
    const events = (data ?? []).filter((e) => pins.includes(e.event_id))

    if (!pins.length) {
        return (
            <div className="empty-panel">
                No markets pinned yet. Open a match and tap ☆ next to its name to follow it here.
                <br />
                <Link to="/home">Go to In-Play</Link>
            </div>
        )
    }
    return <EventSection title="MULTI MARKET" events={events} />
}

export function UnsettledBets() {
    usePageTitle('Unsettled Bets')
    const { data, loading } = usePolling(() => api.bets(), 10000)
    const bets = data ?? []
    return (
        <div className="page-panel">
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Match / Market</th>
                            <th>Runner</th>
                            <th>Type</th>
                            <th className="num">Rate</th>
                            <th className="num">Stake</th>
                            <th className="num">Profit/Loss</th>
                            <th>Placed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bets.length ? (
                            bets.map((b) => (
                                <tr key={b.id} className={`row-${b.side}`}>
                                    <td>{b.client}</td>
                                    <td>
                                        <Link to={`/event/${b.event_id}`}>{b.event_name}</Link>
                                        <small className="sub">{b.market_name}</small>
                                    </td>
                                    <td>{b.runner}</td>
                                    <td className="cap">{b.side}</td>
                                    <td className="num">{b.run ?? fmtPrice(b.rate)}</td>
                                    <td className="num">{fmtAmount(b.stake)}</td>
                                    <td className={`num ${b.pl < 0 ? 'neg' : 'pos'}`}>{fmtAmount(b.pl)}</td>
                                    <td className="nowrap">{fmtDateTime(b.placed_at)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="empty-cell">
                                    {loading ? 'Loading…' : 'No unsettled bets'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Layout of a report that needs bet/settlement data from the Mastan API
export function PendingReport() {
    const { pathname } = useLocation()
    const report = PENDING_REPORTS[pathname]
    usePageTitle(report?.title ?? 'Report')
    if (!report) return <NotFound />

    return (
        <div className="page-panel">
            {report.dateFilter && (
                <div className="toolbar">
                    <label className="inline-field">
                        From
                        <input type="date" disabled />
                    </label>
                    <label className="inline-field">
                        To
                        <input type="date" disabled />
                    </label>
                    <button type="button" className="btn btn-primary" disabled>
                        Search
                    </button>
                </div>
            )}
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            {report.columns.map((c) => (
                                <th key={c}>{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={report.columns.length} className="empty-cell">
                                This report fills in once the Mastan exchange API is connected.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function NotFound() {
    usePageTitle('Not Found')
    return (
        <div className="empty-panel">
            This page doesn't exist. <Link to="/home">Go to In-Play</Link>
        </div>
    )
}
