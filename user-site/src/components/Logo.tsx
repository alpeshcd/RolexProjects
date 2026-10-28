// Placeholder brand mark until the client sends their logo. To swap it, drop the
// file in public/ (e.g. public/logo.png) and render <img src="/logo.png"> here;
// public/favicon.svg is the matching tab icon.
export default function Logo({ brand, size = 'md' }: { brand: string; size?: 'md' | 'lg' }) {
    // "MASTAN365" -> "MASTAN" + "365", so the number can take the accent colour
    const match = brand.match(/^(.*?)\s*(\d+)$/)
    const word = match ? match[1] : brand
    const num = match ? match[2] : ''

    return (
        <span className={`logo logo-${size}`}>
            <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
                <defs>
                    <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#ffd76a" />
                        <stop offset="1" stopColor="#e0782f" />
                    </linearGradient>
                </defs>
                <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#logo-grad)" />
                <path d="M7 21.5 8.6 11l4.6 4.6L16 8.5l2.8 7.1 4.6-4.6L25 21.5z" fill="#fff" />
                <rect x="7.5" y="23" width="17" height="2.6" rx="1.3" fill="#fff" />
            </svg>
            <span className="logo-text">
                <span className="logo-word">{word}</span>
                {num && <span className="logo-num">{num}</span>}
            </span>
        </span>
    )
}
