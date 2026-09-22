import type {Showcase} from "@hapi/shared/prisma/client";

export function getShowcaseName(showcase: Showcase): string {
    let text = ''
    text += showcase.name
    if (showcase.year) text += ` ${showcase.year}`
    if (showcase.semester) text += ` sem${showcase.semester}`
    return text.trim()
}
