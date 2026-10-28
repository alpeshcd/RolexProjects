export default function Logo({ brand, size = 'md' }: { brand?: string; size?: 'md' | 'lg' }) {
    // If brand not provided or generic, default to MASTAN99 to match the screenshot
    const displayBrand = brand && brand.trim() ? brand.toUpperCase() : 'MASTAN99'
    
    // Separate word and number for styling if needed, e.g. MASTAN and 99
    const match = displayBrand.match(/^(.*?)\s*(\d+)$/)
    const word = match ? match[1] : displayBrand
    const num = match ? match[2] : ''

    const isLg = size === 'lg'

    return (
        <span className={`brand-logo ${isLg ? 'brand-logo-lg' : ''}`} title={displayBrand}>
            <span className="brand-logo-text">
                <span className="brand-logo-word">{word}</span>
                {num && <span className="brand-logo-num">{num}</span>}
            </span>
        </span>
    )
}
