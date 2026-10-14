import type {ShowcaseListResponseItem} from "@hapi/shared/types/apiResponses";

export type SemesterShowcaseType = {
    semester: number,
    showcase: ShowcaseListResponseItem,
}

export type YearShowcaseType = {
    year: number,
    showcase?: ShowcaseListResponseItem, // whole-year showcase (semester 0)
    semesters?: SemesterShowcaseType[]
}

export type ConsolidatedShowcaseType = {
    name: string,
    standaloneShowcase?: ShowcaseListResponseItem,
    yearShowcases?: YearShowcaseType[]
}

const STANDALONE_YEAR = 0
const WHOLE_YEAR_SEMESTER = 0

export function buildConsolidatedShowcases(showcases: ShowcaseListResponseItem[], sort = true): ConsolidatedShowcaseType[] {
    const byName = new Map<string, ConsolidatedShowcaseType>()

    for (const s of showcases) {
        let cs = byName.get(s.name)
        if (!cs) {
            cs = {name: s.name}
            byName.set(s.name, cs)
        }

        if (s.year == null || s.year === STANDALONE_YEAR) {
            cs.standaloneShowcase = s
            continue
        }

        const years = (cs.yearShowcases ??= [])
        let ys = years.find((y) => y.year === s.year)
        if (!ys) {
            ys = {year: s.year}
            years.push(ys)
        }

        if (s.semester === WHOLE_YEAR_SEMESTER) {
            ys.showcase = s
        } else {
            (ys.semesters ??= []).push({semester: s.semester, showcase: s})
        }
    }

    const consolidatedList = [...byName.values()]
    if (!sort) return consolidatedList

    for (const cs of consolidatedList) {
        cs.yearShowcases?.sort((a, b) => b.year - a.year)
        cs.yearShowcases?.forEach((ys) => ys.semesters?.sort((a, b) => a.semester - b.semester))
    }

    return consolidatedList.sort((a, b) => {
        const ta = publishedTime(a)
        const tb = publishedTime(b)
        if (ta === undefined && tb === undefined) return 0
        if (ta === undefined) return -1
        if (tb === undefined) return 1
        return ta - tb
    })
}

function getComparisonItem(cs: ConsolidatedShowcaseType): ShowcaseListResponseItem | undefined {
    if (cs.standaloneShowcase) return cs.standaloneShowcase
    const latestYear = cs.yearShowcases?.at(-1)
    return latestYear?.showcase ?? latestYear?.semesters?.at(-1)?.showcase
}

function publishedTime(cs: ConsolidatedShowcaseType): number | undefined {
    const date = getComparisonItem(cs)?.publishedDate
    return date ? new Date(date).getTime() : undefined
}
