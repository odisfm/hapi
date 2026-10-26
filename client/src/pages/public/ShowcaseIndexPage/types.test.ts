import type {ShowcaseListResponseItem} from '@hapi/shared/types/apiResponses'
import {describe, expect, it} from 'vitest'
import {buildConsolidatedShowcases} from './types.ts'

let nextId = 0

function makeShowcase(overrides: Partial<ShowcaseListResponseItem> = {}) {
    nextId++
    return {
        id: `show-${nextId}`,
        name: 'Showcase',
        year: 2025,
        semester: 1,
        publishedDate: null,
        _count: {projects: 0},
        slugs: [],
        ...overrides,
    } as ShowcaseListResponseItem
}

describe('buildConsolidatedShowcases', () => {
    it('returns nothing for no showcases', () => {
        expect(buildConsolidatedShowcases([])).toEqual([])
    })

    describe('grouping', () => {
        it('groups showcases with the same name together', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({name: 'Expo', year: 2024}),
                makeShowcase({name: 'Hackathon', year: 2024}),
                makeShowcase({name: 'Expo', year: 2025}),
            ], false)

            expect(result.map((cs) => cs.name)).toEqual(['Expo', 'Hackathon'])
            expect(result[0].yearShowcases?.map((ys) => ys.year)).toEqual([2024, 2025])
        })

        it('treats a showcase with year 0 as standalone', () => {
            const standalone = makeShowcase({name: 'Special', year: 0})
            const [result] = buildConsolidatedShowcases([standalone])

            expect(result.standaloneShowcase).toBe(standalone)
            expect(result.yearShowcases).toBeUndefined()
        })

        it('treats a showcase with no year as standalone', () => {
            const standalone = makeShowcase({name: 'Special', year: null as unknown as number})
            const [result] = buildConsolidatedShowcases([standalone])

            expect(result.standaloneShowcase).toBe(standalone)
        })

        it('treats semester 0 as the whole-year showcase', () => {
            const wholeYear = makeShowcase({year: 2025, semester: 0})
            const [result] = buildConsolidatedShowcases([wholeYear])

            expect(result.yearShowcases).toEqual([{year: 2025, showcase: wholeYear}])
        })

        it('puts other semesters under their year', () => {
            const s1 = makeShowcase({year: 2025, semester: 1})
            const s2 = makeShowcase({year: 2025, semester: 2})
            const [result] = buildConsolidatedShowcases([s1, s2])

            expect(result.yearShowcases).toEqual([{
                year: 2025,
                semesters: [{semester: 1, showcase: s1}, {semester: 2, showcase: s2}],
            }])
        })

        it('keeps a whole-year showcase alongside semesters of the same year', () => {
            const wholeYear = makeShowcase({year: 2025, semester: 0})
            const s1 = makeShowcase({year: 2025, semester: 1})
            const [result] = buildConsolidatedShowcases([s1, wholeYear])

            expect(result.yearShowcases).toEqual([{
                year: 2025,
                showcase: wholeYear,
                semesters: [{semester: 1, showcase: s1}],
            }])
        })
    })

    describe('sorting', () => {
        it('leaves the input order when sorting is turned off', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({year: 2023, semester: 2}),
                makeShowcase({year: 2025, semester: 2}),
                makeShowcase({year: 2025, semester: 1}),
            ], false)

            expect(result[0].yearShowcases?.map((ys) => ys.year)).toEqual([2023, 2025])
            expect(result[0].yearShowcases?.[1].semesters?.map((s) => s.semester)).toEqual([2, 1])
        })

        it('orders years newest first and semesters in ascending order', () => {
            const [result] = buildConsolidatedShowcases([
                makeShowcase({year: 2023, semester: 2}),
                makeShowcase({year: 2025, semester: 2}),
                makeShowcase({year: 2024, semester: 1}),
                makeShowcase({year: 2025, semester: 1}),
            ])

            expect(result.yearShowcases?.map((ys) => ys.year)).toEqual([2025, 2024, 2023])
            expect(result.yearShowcases?.[0].semesters?.map((s) => s.semester)).toEqual([1, 2])
        })

        it('orders groups by published date, oldest first', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({name: 'Newer', year: 0, publishedDate: new Date('2025-06-01')}),
                makeShowcase({name: 'Older', year: 0, publishedDate: new Date('2024-06-01')}),
            ])

            expect(result.map((cs) => cs.name)).toEqual(['Older', 'Newer'])
        })

        it('puts unpublished groups before published ones', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({name: 'Published', year: 0, publishedDate: new Date('2024-06-01')}),
                makeShowcase({name: 'Unpublished', year: 0}),
                makeShowcase({name: 'Also published', year: 0, publishedDate: new Date('2025-06-01')}),
            ])

            expect(result.map((cs) => cs.name)).toEqual(['Unpublished', 'Published', 'Also published'])
        })

        it('keeps the input order between unpublished groups', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({name: 'First', year: 0}),
                makeShowcase({name: 'Second', year: 0}),
            ])

            expect(result.map((cs) => cs.name)).toEqual(['First', 'Second'])
        })

        it('compares year groups by the whole-year showcase of their oldest year', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({name: 'B', year: 2025, semester: 0, publishedDate: new Date('2020-01-01')}),
                makeShowcase({name: 'B', year: 2020, semester: 0, publishedDate: new Date('2026-01-01')}),
                makeShowcase({name: 'A', year: 0, publishedDate: new Date('2023-01-01')}),
            ])

            expect(result.map((cs) => cs.name)).toEqual(['A', 'B'])
        })

        it('falls back to the last semester when a year has no whole-year showcase', () => {
            const result = buildConsolidatedShowcases([
                makeShowcase({name: 'B', year: 2025, semester: 1, publishedDate: new Date('2020-01-01')}),
                makeShowcase({name: 'B', year: 2025, semester: 2, publishedDate: new Date('2026-01-01')}),
                makeShowcase({name: 'A', year: 0, publishedDate: new Date('2023-01-01')}),
            ])

            expect(result.map((cs) => cs.name)).toEqual(['A', 'B'])
        })
    })
})
