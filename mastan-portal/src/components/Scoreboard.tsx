import { useState } from 'react'
import type { BallGameScore, CricketScore, EventDetail } from '../types'

function RunRateChart({ series, maxOvers }: { series: number[]; maxOvers: number }) {
    // Scales with the panel width; label sizes are in these units
    const W = 1000
    const H = 150
    const pad = { l: 40, r: 16, t: 14, b: 30 }
    const xMax = Math.min(maxOvers, Math.max(20, Math.ceil((series.length + 5) / 10) * 10))
    const yMax = Math.max(5, Math.ceil(Math.max(0, ...series)) + 1)
    const x = (over: number) => pad.l + (over / xMax) * (W - pad.l - pad.r)
    const y = (rr: number) => pad.t + (1 - rr / yMax) * (H - pad.t - pad.b)
    const points = series.map((rr, i) => `${x(i + 1)},${y(rr)}`)
    const ticks = Array.from({ length: Math.floor(xMax / 10) }, (_, i) => (i + 1) * 10)

    return (
        <svg className="rr-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Run rate by over">
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={x(t)} x2={x(t)} y1={pad.t} y2={H - pad.b} className="rr-grid" />
                    <text x={x(t)} y={H - 8} className="rr-label" textAnchor="middle">
                        {t}
                    </text>
                </g>
            ))}
            <text x={8} y={y(yMax) + 14} className="rr-label">
                {yMax}
            </text>
            <text x={8} y={H - pad.b} className="rr-label">
                0
            </text>
            {points.length > 1 && (
                <>
                    <polygon
                        className="rr-area"
                        points={`${x(1)},${y(0)} ${points.join(' ')} ${x(series.length)},${y(0)}`}
                    />
                    <polyline className="rr-line" points={points.join(' ')} />
                </>
            )}
        </svg>
    )
}

function CricketBoard({ score }: { score: CricketScore }) {
    const [showChart, setShowChart] = useState(true)
    // Left is the side that batted first
    const firstBatting = score.innings === 1
    const left = firstBatting ? score.batting : score.bowling
    const right = firstBatting ? score.bowling : score.batting
    const leftSub = firstBatting ? `${score.crr} CRR` : score.first_innings_rr ? `${score.first_innings_rr} RR` : ''
    const rightSub = firstBatting ? 'Yet to bat' : `${score.crr} CRR`
    const current = `${score.runs}/${score.wickets}`

    return (
        <div className="scoreboard">
            <div className="score-pill">
                INN {score.innings} | {score.overs} OV
            </div>
            <div className="score-row">
                <div className="score-team">
                    <b>{left}</b>
                    <small>{leftSub}</small>
                </div>
                <div className="score-center">
                    <b>{score.first_innings ? `${score.first_innings} : ${current}` : current}</b>
                    <small>{score.message}</small>
                </div>
                <div className="score-team right">
                    <b>{right}</b>
                    <small>{rightSub}</small>
                </div>
            </div>
            <button type="button" className="rr-toggle" onClick={() => setShowChart((s) => !s)} aria-expanded={showChart}>
                RUN RATE {showChart ? '▴' : '▾'}
            </button>
            {showChart && <RunRateChart series={score.rr_series} maxOvers={score.max_overs} />}
        </div>
    )
}

function BallGameBoard({ event, score }: { event: EventDetail; score: BallGameScore }) {
    return (
        <div className="scoreboard">
            <div className="score-pill">{score.status}</div>
            <div className="score-row">
                <div className="score-team">
                    <b>{event.home}</b>
                    <span className="score-big">{score.home}</span>
                </div>
                <div className="score-center">
                    <small>{event.competition}</small>
                </div>
                <div className="score-team right">
                    <b>{event.away}</b>
                    <span className="score-big">{score.away}</span>
                </div>
            </div>
        </div>
    )
}

export default function Scoreboard({ event }: { event: EventDetail }) {
    const score = event.score
    if (!score) return null
    return score.type === 'cricket' ? (
        <CricketBoard score={score as CricketScore} />
    ) : (
        <BallGameBoard event={event} score={score as BallGameScore} />
    )
}
