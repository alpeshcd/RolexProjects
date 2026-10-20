import { useCallback, useEffect, useRef, useState } from 'react'

// Fetches now and then every `intervalMs` while the tab is visible. A slow
// response never overlaps the next request. Changing `key` starts over.
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, key: unknown = null) {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const fetcherRef = useRef(fetcher)
    fetcherRef.current = fetcher
    const [tick, setTick] = useState(0)
    const lastKey = useRef(key)

    useEffect(() => {
        let cancelled = false
        let timer: number | undefined
        // A new key is a different thing to show; reload() keeps the old data on screen
        if (lastKey.current !== key) {
            lastKey.current = key
            setData(null)
            setError(null)
            setLoading(true)
        }

        const run = async () => {
            if (document.hidden) {
                timer = window.setTimeout(run, intervalMs)
                return
            }
            try {
                const result = await fetcherRef.current()
                if (cancelled) return
                setData(result)
                setError(null)
            } catch (e) {
                if (cancelled) return
                setError(e instanceof Error ? e.message : 'Something went wrong')
            } finally {
                if (!cancelled) {
                    setLoading(false)
                    timer = window.setTimeout(run, intervalMs)
                }
            }
        }
        run()
        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }
    }, [intervalMs, key, tick])

    const reload = useCallback(() => setTick((t) => t + 1), [])
    return { data, error, loading, reload, setData }
}
