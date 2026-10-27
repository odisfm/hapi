export function normalizeMarkdown(value: string | null | undefined): string {
    return (value || "").replace(/\r\n?/g, "\n").replace(/\n+$/, "")
}
