const amountFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export function fmtAmount(value: number | null | undefined): string {
    return amountFormat.format(value ?? 0)
}

// 2.30 -> "2.3", 6.00 -> "6"
export function fmtPrice(value: number): string {
    return String(Number(value.toFixed(2)))
}

const pad = (n: number) => String(n).padStart(2, '0')

// "18/10/2026 09:30:00 AM" in the viewer's time zone, like the Mastan panel
export function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) return '-'
    // Backend timestamps without a zone are UTC
    const d = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`)
    if (Number.isNaN(d.getTime())) return '-'
    const h = d.getHours() % 12 || 12
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

// yyyy-mm-dd for <input type="date">
export function isoDay(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
