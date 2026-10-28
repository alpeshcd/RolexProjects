// Which Mastan domain this site serves comes from the address bar:
// mastan365.localhost -> mastan365 today, mastan365.com -> mastan365
// once it's hosted. The backend matches it against the Rolex domain portals.
// Plain localhost falls back to VITE_DEFAULT_PORTAL.
export function portalHost(): string {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
        return import.meta.env.VITE_DEFAULT_PORTAL || 'mastan365'
    }
    return host
}
