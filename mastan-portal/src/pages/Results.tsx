import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from '../auth/AuthContext'
import { usePageTitle, useToast } from '../components/Layout'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import type { PendingMarket } from '../types'

const VOID = 'VOID'

function DeclareRow({ market, onDone }: { market: PendingMarket; onDone: () => void }) {
    const toast = useToast()
    const [winner, setWinner] = useState('')
    const [confirming, setConfirming] = useState(false)
    const [busy, setBusy] = useState(false)

    const declare = async () => {
        setBusy(true)
        try {
            const res = await api.declareResult(market.market_id, winner)
            toast(
                res.winner === VOID
                    ? `${market.event_name}: ${res.bet_count} bets voided`
                    : `${market.event_name}: ${res.winner} won, ${res.bet_count} bets settled`,
            )
            onDone()
        } catch (err) {
            toast(err instanceof Error ? err.message : 'Could not declare the result', 'error')
            setConfirming(false)
        } finally {
            setBusy(false)
        }
    }

    return (
        <tr>
            <td>
                <Link to={`/event/${market.event_id}`}>{market.event_name}</Link>
                <small className="sub">
                    {market.sport_name} · {market.market_name}
                </small>
            </td>
            <td className="num">{market.bet_count}</td>
            <td className="num">{fmtAmount(market.total_stake)}</td>
            <td>
                {market.runners.map((r) => (
                    <div key={r} className="nowrap">
                        {r}: <b className={(market.book[r] ?? 0) < 0 ? 'neg' : 'pos'}>{fmtAmount(market.book[r] ?? 0)}</b>
                    </div>
                ))}
            </td>
            <td>
                {confirming ? (
                    <div className="toolbar">
                        <span>
                            {winner === VOID ? 'Void every bet on this market?' : <>Declare <b>{winner}</b> as winner?</>}
                        </span>
                        <button type="button" className="btn btn-green" onClick={declare} disabled={busy}>
                            {busy ? 'Settling…' : 'Confirm'}
                        </button>
                        <button type="button" className="btn" onClick={() => setConfirming(false)} disabled={busy}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="toolbar">
                        <select value={winner} onChange={(e) => setWinner(e.target.value)} aria-label="Winner">
                            <option value="">Select winner</option>
                            {market.runners.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                            <option value={VOID}>Void (cancel all bets)</option>
                        </select>
                        <button type="button" className="btn btn-primary" disabled={!winner} onClick={() => setConfirming(true)}>
                            Declare
                        </button>
                    </div>
                )}
            </td>
        </tr>
    )
}

export default function Results() {
    usePageTitle('Declare Result')
    const account = useAccount()
    const pending = usePolling(api.pendingResults, 10000)
    const history = usePolling(api.results, 30000)

    if (account.role !== 'admin') {
        return <div className="empty-panel">Only the Admin account can declare results.</div>
    }

    const reload = () => {
        pending.reload()
        history.reload()
    }

    return (
        <>
            <div className="page-panel">
                <h2 className="panel-title">Markets waiting for a result</h2>
                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Match / Market</th>
                                <th className="num">Bets</th>
                                <th className="num">Total Stake</th>
                                <th>House P/L if it wins</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(pending.data ?? []).map((m) => (
                                <DeclareRow key={m.market_id} market={m} onDone={reload} />
                            ))}
                            {!pending.data?.length && (
                                <tr>
                                    <td colSpan={5} className="empty-cell">
                                        {pending.loading ? 'Loading…' : pending.error ?? 'No open bets waiting for a result'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="page-panel" style={{ marginTop: 12 }}>
                <h2 className="panel-title">Declared results</h2>
                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Match / Market</th>
                                <th>Winner</th>
                                <th className="num">Bets</th>
                                <th>Declared By</th>
                                <th>Declared At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(history.data ?? []).map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        {r.event_name}
                                        <small className="sub">{r.market_name}</small>
                                    </td>
                                    <td className="strong">{r.winner === VOID ? 'Void' : r.winner}</td>
                                    <td className="num">{r.bet_count}</td>
                                    <td>{r.declared_by}</td>
                                    <td className="nowrap">{fmtDateTime(r.declared_at)}</td>
                                </tr>
                            ))}
                            {!history.data?.length && (
                                <tr>
                                    <td colSpan={5} className="empty-cell">
                                        {history.loading ? 'Loading…' : 'No results declared yet'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
