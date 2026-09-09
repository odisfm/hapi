export function toTsQuery(term: string): string {
    return term
        .trim()
        .replace(/[&|!():*<>]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(" & ");
}
