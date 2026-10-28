import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../lib/api'
import { fmtAmount, tickDown, tickUp } from '../lib/format'
import type { Selection } from '../types'
import { useToast } from './Layout'

const QUICK_STAKES = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000]

// Bookmaker rates are shown as 45 for 1.45 decimal odds
export function decimalOdds(sel: Pick<Selection, 'marketType'>, rate: number): number {
    return sel.marketType === 'bookmaker' ? 1 + rate / 100 : rate
}

// The player's profit/loss if the selection wins, and if it loses
export function slipAmounts(side: Selection['side'], odds: number, stake: number): { win: number; lose: number } {
    const profit = Math.round(stake * (odds - 1) * 100) / 100
    return side === 'back' ? { win: profit, lose: -stake } : { win: -profit, lose: stake }
}

interface Props {
    eventId: number
    selection: Selection
    inplay: boolean
    onChange: (amounts: { win: number; lose: number } | null) => void
    onCancel: () => void
    onPlaced: () => void
}

export default function BetSlip({ eventId, selection, inplay, onChange, onCancel, onPlaced }: Props) {
    const { setAccount, account } = useAuth()
    const toast = useToast()
    const [rate, setRate] = useState(selection.rate)
    const [stake, setStake] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const bookmaker = selection.marketType === 'bookmaker'
    const stakeNum = Number(stake) || 0
    const odds = decimalOdds(selection, rate)
    const { win, lose } = slipAmounts(selection.side, odds, stakeNum)

    useEffect(() => {
        onChange(stakeNum > 0 ? { win, lose } : null)
    }, [win, lose, stakeNum, onChange])

    const step = (up: boolean) => {
        setRate((r) => (bookmaker ? Math.max(1, r + (up ? 1 : -1)) : up ? tickUp(r) : tickDown(r)))
    }

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (!account) {
            setError('Please login to your account to place bets.')
            return
        }
        if (stakeNum < selection.min || stakeNum > selection.max) {
            setError(`Stake must be between ${fmtAmount(selection.min)} and ${fmtAmount(selection.max)}`)
            return
        }
        setBusy(true)
        setError(null)
        try {
            const res = await api.placeBet({
                event_id: eventId,
                market_type: selection.marketType,
                market_id: selection.marketId,
                selection: selection.runner,
                side: selection.side,
                odds: Number(odds.toFixed(2)),
                stake: stakeNum,
            })
            setAccount(res.account)
            toast(`Bet placed: ${selection.side === 'back' ? 'Back' : 'Lay'} ${selection.runner} @ ${rate} for ${fmtAmount(stakeNum)}`)
            onPlaced()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bet could not be placed')
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className={`slip ${selection.side}`} onSubmit={submit}>
            <div className="slip-row">
                <div className="slip-field">
                    <span>{bookmaker ? 'Rate' : 'Odds'}</span>
                    <div className="stepper">
                        <button type="button" onClick={() => step(false)} aria-label="Lower odds" disabled={busy}>
                            −
                        </button>
                        <input
                            inputMode="decimal"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value) || 0)}
                            aria-label={bookmaker ? 'Rate' : 'Odds'}
                            disabled={busy}
                        />
                        <button type="button" onClick={() => step(true)} aria-label="Higher odds" disabled={busy}>
                            +
                        </button>
                    </div>
                </div>
                <label className="slip-field">
                    <span>Stake</span>
                    <input
                        inputMode="numeric"
                        value={stake}
                        onChange={(e) => setStake(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder={`${selection.min}–${selection.max}`}
                        autoFocus
                        disabled={busy}
                    />
                </label>
            </div>
            <div className="quick-stakes">
                {QUICK_STAKES.filter((s) => s <= selection.max).map((s) => (
                    <button type="button" key={s} onClick={() => setStake(String(s))} disabled={busy}>
                        {s >= 1000 ? `${s / 1000}K` : s}
                    </button>
                ))}
            </div>
            <div className="slip-summary">
                {selection.side === 'back' ? (
                    <>
                        Profit: <b className="pos">{fmtAmount(win)}</b>
                    </>
                ) : (
                    <>
                        Liability: <b className="neg">{fmtAmount(-win)}</b>
                    </>
                )}
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="slip-actions">
                <button type="button" className="btn btn-light" onClick={onCancel} disabled={busy}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy || stakeNum <= 0}>
                    {busy ? (inplay ? 'Placing… please wait' : 'Placing…') : 'Place Bet'}
                </button>
            </div>
        </form>
    )
}
