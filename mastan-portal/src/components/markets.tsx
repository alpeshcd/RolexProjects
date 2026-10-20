import { fmtAmount, fmtPrice } from '../lib/format'
import type { BookmakerMarket, FancyLine, LastDigitMarket, MarketStatus, MatchOddsMarket } from '../types'
import { PriceBox } from './odds'

function statusLabel(status: MarketStatus): string | null {
    if (status === 'OPEN') return null
    return status.replace(/_/g, ' ')
}

function Limits({ min, max }: { min: number; max: number }) {
    return (
        <span className="limits">
            Min: {fmtAmount(min)} Max: {fmtAmount(max)}
        </span>
    )
}

function MarketHead({ name, min, max, right }: { name: string; min?: number; max?: number; right?: string[] }) {
    return (
        <div className="market-head">
            <span className="market-tab">{name}</span>
            {min !== undefined && max !== undefined && <Limits min={min} max={max} />}
            {right && (
                <span className="market-cols">
                    {right.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </span>
            )}
        </div>
    )
}

export function MatchOddsTable({ market }: { market: MatchOddsMarket }) {
    const status = statusLabel(market.status)
    return (
        <section className="market">
            <MarketHead name={market.name.toUpperCase()} min={market.min} max={market.max} />
            <div className="mo-grid mo-header">
                <span className="runner-name" />
                <div className="mo-prices">
                    <span className="depth" />
                    <span className="depth" />
                    <span className="best col-back">BACK</span>
                    <span className="best col-lay">LAY</span>
                    <span className="depth" />
                    <span className="depth" />
                </div>
            </div>
            {market.runners.map((r) => (
                <div className="mo-grid mo-row" key={r.name}>
                    <span className="runner-name">{r.name}</span>
                    <div className="mo-prices">
                        {[2, 1, 0].map((lv) => (
                            <div key={`b${lv}`} className={lv ? 'depth' : 'best'}>
                                <PriceBox side="back" ps={r.back[lv]} />
                            </div>
                        ))}
                        {[0, 1, 2].map((lv) => (
                            <div key={`l${lv}`} className={lv ? 'depth' : 'best'}>
                                <PriceBox side="lay" ps={r.lay[lv]} />
                            </div>
                        ))}
                        {status && <div className="suspended">{status}</div>}
                    </div>
                </div>
            ))}
        </section>
    )
}

export function BookmakerTable({ market }: { market: BookmakerMarket }) {
    const status = statusLabel(market.status)
    return (
        <section className="market">
            <MarketHead name="BOOKMAKER" min={market.min} max={market.max} right={['BACK', 'LAY']} />
            {market.runners.map((r) => (
                <div className="line-row" key={r.name}>
                    <span className="runner-name">{r.name}</span>
                    <div className="line-cells">
                        <div className="cell back">
                            <span className="p">{r.back}</span>
                        </div>
                        <div className="cell lay">
                            <span className="p">{r.lay}</span>
                        </div>
                        {status && <div className="suspended">{status}</div>}
                    </div>
                </div>
            ))}
        </section>
    )
}

export function FancyTable({ lines }: { lines: FancyLine[] }) {
    return (
        <section className="market">
            <MarketHead name="FANCY" right={['NO', 'YES']} />
            {lines.map((line) => {
                const status = statusLabel(line.status)
                const oddEven = line.type === 'oddeven'
                return (
                    <div className="line-row" key={line.id}>
                        <span className="runner-name">
                            {line.name}
                            <Limits min={line.min} max={line.max} />
                        </span>
                        <div className="line-cells">
                            <div className={`cell ${oddEven ? 'back' : 'lay'}`}>
                                <span className="p">{oddEven ? fmtPrice(line.no.value) : line.no.value}</span>
                                <span className="s">{line.no.rate}</span>
                            </div>
                            <div className="cell back">
                                <span className="p">{oddEven ? fmtPrice(line.yes.value) : line.yes.value}</span>
                                <span className="s">{line.yes.rate}</span>
                            </div>
                            {status && <div className="suspended">{status}</div>}
                        </div>
                    </div>
                )
            })}
        </section>
    )
}

export function LastDigitTable({ market }: { market: LastDigitMarket }) {
    const status = statusLabel(market.status)
    return (
        <section className="market">
            <MarketHead name={market.name} right={['BACK']} />
            {market.runners.map((r) => (
                <div className="line-row single" key={r.name}>
                    <span className="runner-name">{r.name}</span>
                    <div className="line-cells">
                        <div className="cell back">
                            <span className="p">{fmtPrice(r.back.price)}</span>
                            <span className="s">{r.back.size}</span>
                        </div>
                        {status && <div className="suspended">{status}</div>}
                    </div>
                </div>
            ))}
        </section>
    )
}
