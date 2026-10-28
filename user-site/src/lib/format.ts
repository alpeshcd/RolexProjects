const amountFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export function fmtAmount(value: number | null | undefined): string {
    return amountFormat.format(value ?? 0)
}

// 2.30 -> "2.3", 6.00 -> "6"
export function fmtPrice(value: number): string {
    return String(Number(value.toFixed(2)))
}

// 25300 -> "25.3K", for the small size line under a price
export function fmtSize(value: number): string {
    if (value >= 100000) return `${fmtPrice(value / 100000)}L`
    if (value >= 1000) return `${fmtPrice(value / 1000)}K`
    return String(Math.round(value))
}

const pad = (n: number) => String(n).padStart(2, '0')

// Backend timestamps without a zone are UTC
function parse(iso: string): Date {
    return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`)
}

// "28/10/2026 09:30:00 AM" in the viewer's time zone
export function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) return '-'
    const d = parse(iso)
    if (Number.isNaN(d.getTime())) return '-'
    const h = d.getHours() % 12 || 12
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "Oct 28 2026 14:00", the match start time in the event lists
export function fmtEventDate(iso: string): string {
    const d = parse(iso)
    if (Number.isNaN(d.getTime())) return ''
    return `${MONTHS[d.getMonth()]} ${pad(d.getDate())} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// yyyy-mm-dd for <input type="date">
export function isoDay(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Price ladder steps, as on the exchange: 1.01, 1.02 … 2.02, 2.04 … 3.05 …
const TICKS: [number, number][] = [
    [2, 0.01],
    [3, 0.02],
    [4, 0.05],
    [6, 0.1],
    [10, 0.2],
    [20, 0.5],
    [30, 1],
    [50, 2],
    [100, 5],
    [1000, 10],
]

export function tickUp(price: number): number {
    for (const [limit, step] of TICKS) {
        if (price < limit - 1e-9) return Math.min(1000, Number((price + step).toFixed(2)))
    }
    return price
}

export function tickDown(price: number): number {
    for (const [limit, step] of TICKS) {
        if (price <= limit + 1e-9) return Math.max(1.01, Number((price - step).toFixed(2)))
    }
    return price
}
