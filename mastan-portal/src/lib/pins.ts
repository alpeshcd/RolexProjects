import { useCallback, useState } from 'react'
import { portalHost } from './portal'

// Events pinned to Multi Market, kept per browser
const KEY = `mastan-panel-pins:${portalHost()}`

function read(): number[] {
    try {
        const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]')
        return Array.isArray(ids) ? ids.filter((n) => typeof n === 'number') : []
    } catch {
        return []
    }
}

export function usePins() {
    const [pins, setPins] = useState<number[]>(read)

    const toggle = useCallback((eventId: number) => {
        setPins((current) => {
            const next = current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
            try {
                localStorage.setItem(KEY, JSON.stringify(next))
            } catch {
                // Storage blocked: pins last until reload
            }
            return next
        })
    }, [])

    return { pins, toggle }
}
