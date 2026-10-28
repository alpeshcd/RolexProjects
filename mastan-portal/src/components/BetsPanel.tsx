import { useState } from 'react'
import { api } from '../lib/api'
import { fmtAmount, fmtDateTime, fmtPrice } from '../lib/format'
import { usePolling } from '../lib/usePolling'
import type { Bet } from '../types'

function BetTable({ bets, fancy }: { bets: Bet[]; fancy?: boolean }) {
    return (
        <div className="table-scroll">
            <table className="data-table compact">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Runner</th>
                        <th>{fancy ? 'Run' : 'Rate'}</th>
                        <th>Stake</th>
                        <th>Profit/Loss</th>
                        <th>Time/Date</th>
                    </tr>
                </thead>
                <tbody>
                    {bets.length ? (
                        bets.map((b) => (
                            <tr key={b.id} className={`row-${b.side}`}>
                                <td>{b.client}</td>
                                <td>{b.runner}</td>
                                <td>{fancy ? b.run : fmtPrice(b.rate)}</td>
                                <td>{fmtAmount(b.stake)}</td>
                                <td className={b.pl < 0 ? 'neg' : 'pos'}>{fmtAmount(b.pl)}</td>
                                <td>{fmtDateTime(b.placed_at)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="empty-cell">
                                No bets yet
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default function BetsPanel({ eventId }: { eventId: number }) {
    const [tab, setTab] = useState<'matched' | 'unmatched' | 'tv'>('matched')
    const { data } = usePolling(() => api.bets(eventId), 5000, eventId)
    const bets = data ?? []
    const fancyBets = bets.filter((b) => b.market === 'fancy')
    const otherBets = bets.filter((b) => b.market !== 'fancy')

    return (
        <div className="bets-panel">
            <div className="tabs" role="tablist">
                <button type="button" role="tab" aria-selected={tab === 'matched'} onClick={() => setTab('matched')}>
                    MATCHED
                </button>
                <button type="button" role="tab" aria-selected={tab === 'unmatched'} onClick={() => setTab('unmatched')}>
                    UN-MATCHED
                </button>
                <button type="button" role="tab" aria-selected={tab === 'tv'} onClick={() => setTab('tv')} aria-label="Live TV">
                    📺
                </button>
            </div>
            {tab === 'tv' ? (
                <div className="tv-box">Live TV will play here once the Mastan stream API is connected.</div>
            ) : (
                <>
                    {/* The house takes every bet in full, so nothing stays unmatched */}
                    <BetTable bets={tab === 'matched' ? otherBets : []} />
                    <div className="bets-subtitle">Fancy Bet List</div>
                    <BetTable bets={tab === 'matched' ? fancyBets : []} fancy />
                </>
            )}
        </div>
    )
}
