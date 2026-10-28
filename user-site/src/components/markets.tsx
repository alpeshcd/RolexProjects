import type { ReactNode } from 'react'
import { fmtAmount, fmtPrice, fmtSize } from '../lib/format'
import type { BookmakerMarket, MarketStatus, MarketType, MatchOddsMarket, PriceSize, Selection, Side } from '../types'

// The open bet slip's stake, played through a market so each runner shows what it would become
export interface SlipPreview {
    marketId: string
    runner: string
    win: number
    lose: number
}

interface MarketProps {
    positions: Record<string, number> | undefined
    canBet: boolean
    onPick: (sel: Selection) => void
    // The runner whose bet slip is open in this market, and the slip itself
    slipRunner: string | null
    slip: ReactNode
    preview: SlipPreview | null
}

function statusLabel(status: MarketStatus): string | null {
    if (status === 'OPEN') return null
    return status.replace(/_/g, ' ')
}

function signed(v: number): string {
    return `${v > 0 ? '+' : ''}${fmtAmount(v)}`
}

function Position({ runner, positions, preview, marketId }: {
    runner: string
    positions: Record<string, number> | undefined
    preview: SlipPreview | null
    marketId: string
}) {
    const current = positions?.[runner]
    const next =
        preview && preview.marketId === marketId
            ? (current ?? 0) + (preview.runner === runner ? preview.win : preview.lose)
            : undefined
    if (current === undefined && next === undefined) return null
    return (
        <span className="mk-pos">
            {current !== undefined && <span className={current < 0 ? 'neg' : 'pos'}>{signed(current)}</span>}
            {next !== undefined && <span className={`mk-next ${next < 0 ? 'neg' : 'pos'}`}>» {signed(next)}</span>}
        </span>
    )
}

function PriceButton({ side, label, size, depth, disabled, onClick }: {
    side: Side
    label: string
    size?: string
    depth?: boolean
    disabled: boolean
    onClick: () => void
}) {
    return (
        <button type="button" className={`pc ${side}${depth ? ' depth' : ''}`} disabled={disabled} onClick={onClick}>
            <b>{label}</b>
            {size && <small>{size}</small>}
        </button>
    )
}

function MarketHead({ name, min, max, cols }: { name: string; min: number; max: number; cols: string[] }) {
    return (
        <div className="mk-head">
            <span className="mk-title">{name}</span>
            <span className="mk-limits">
                Min: {fmtAmount(min)} | Max: {fmtAmount(max)}
            </span>
            <span className="mk-cols">
                {cols.map((c) => (
                    <span key={c} className={c.toLowerCase()}>
                        {c}
                    </span>
                ))}
            </span>
        </div>
    )
}

function pick(type: MarketType, market: { id: string; min: number; max: number }, runner: string, runners: string[], side: Side, rate: number): Selection {
    return { marketType: type, marketId: market.id, runner, runners, side, rate, min: market.min, max: market.max }
}

export function MatchOdds({ market, positions, canBet, onPick, slipRunner, slip, preview }: MarketProps & { market: MatchOddsMarket }) {
    const status = statusLabel(market.status)
    const names = market.runners.map((r) => r.name)
    const disabled = !canBet || !!status

    const button = (side: Side, ps: PriceSize | undefined, runner: string, depth: boolean) => (
        <PriceButton
            key={`${side}${depth ? ps?.price : 'best'}`}
            side={side}
            depth={depth}
            label={ps ? fmtPrice(ps.price) : '-'}
            size={ps ? fmtSize(ps.size) : undefined}
            disabled={disabled || !ps}
            onClick={() => ps && onPick(pick('match_odds', market, runner, names, side, ps.price))}
        />
    )

    return (
        <section className="market">
            <MarketHead name={market.name.toUpperCase()} min={market.min} max={market.max} cols={['BACK', 'LAY']} />
            {market.runners.map((r) => (
                <div key={r.name}>
                    <div className="mk-row">
                        <div className="mk-runner">
                            <span className="mk-name">{r.name}</span>
                            <Position runner={r.name} positions={positions} preview={preview} marketId={market.id} />
                        </div>
                        <div className="mk-prices mo">
                            {button('back', r.back[2], r.name, true)}
                            {button('back', r.back[1], r.name, true)}
                            {button('back', r.back[0], r.name, false)}
                            {button('lay', r.lay[0], r.name, false)}
                            {button('lay', r.lay[1], r.name, true)}
                            {button('lay', r.lay[2], r.name, true)}
                            {status && <div className="suspended">{status}</div>}
                        </div>
                    </div>
                    {slipRunner === r.name && slip}
                </div>
            ))}
        </section>
    )
}

export function Bookmaker({ market, positions, canBet, onPick, slipRunner, slip, preview }: MarketProps & { market: BookmakerMarket }) {
    const status = statusLabel(market.status)
    const names = market.runners.map((r) => r.name)
    const disabled = !canBet || !!status

    return (
        <section className="market">
            <MarketHead name="BOOKMAKER" min={market.min} max={market.max} cols={['BACK', 'LAY']} />
            {market.runners.map((r) => (
                <div key={r.name}>
                    <div className="mk-row">
                        <div className="mk-runner">
                            <span className="mk-name">{r.name}</span>
                            <Position runner={r.name} positions={positions} preview={preview} marketId={market.id} />
                        </div>
                        <div className="mk-prices bm">
                            <PriceButton
                                side="back"
                                label={r.back > 0 ? String(r.back) : '-'}
                                disabled={disabled || r.back <= 0}
                                onClick={() => onPick(pick('bookmaker', market, r.name, names, 'back', r.back))}
                            />
                            <PriceButton
                                side="lay"
                                label={r.lay > 0 ? String(r.lay) : '-'}
                                disabled={disabled || r.lay <= 0}
                                onClick={() => onPick(pick('bookmaker', market, r.name, names, 'lay', r.lay))}
                            />
                            {status && <div className="suspended">{status}</div>}
                        </div>
                    </div>
                    {slipRunner === r.name && slip}
                </div>
            ))}
        </section>
    )
}
