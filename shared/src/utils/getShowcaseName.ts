import type {Showcase} from "../generated/prisma/client";
import type {ShowcaseType} from "../types/showcase";

export function getShowcaseName(showcase: Showcase | ShowcaseType): string {
    let text = ''
    text += showcase.name
    if (showcase.year) text += ` ${showcase.year}`
    if (showcase.semester) text += ` sem${showcase.semester}`
    return text.trim()
}
