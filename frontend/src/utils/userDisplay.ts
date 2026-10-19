/** Two-letter avatar initials: "System Administrator" -> "SA", "admin" -> "AD" */
export function getInitials(name = '') {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.trim().slice(0, 2).toUpperCase()
}

/** Human-readable role label: "super_master" -> "Super Master" */
export function formatRole(role = '') {
    return role
        .replace(/[_-]+/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}
