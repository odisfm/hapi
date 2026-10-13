import {describe, expect, it} from 'vitest'
import {
    applySearchUpdate,
    parseSearchParams,
    toApiSearchParams,
    writeSearchParams,
} from './useProjectSearchParams.ts'

describe('project search params', () => {
    it('reads every field from the address, with 1-based pages', () => {
        const query = parseSearchParams(new URLSearchParams(
            'q=space+maps&page=3&categoryNames=Games,Mobile+Apps&showcase=show-1&published=unpublished',
        ))

        expect(query).toEqual({
            searchTerm: 'space maps',
            page: 2,
            categoryNames: 'Games,Mobile Apps',
            showcase: 'show-1',
            published: 'unpublished',
        })
    })

    it.each([
        ['page=abc'],
        ['page=0'],
        ['page=-2'],
        ['page=1.5'],
        ['published=maybe'],
        ['q='],
        ['categoryNames=,,'],
    ])('falls back to the default search for %s', (search) => {
        expect(parseSearchParams(new URLSearchParams(search))).toEqual({page: 0})
    })

    it('tidies blank and padded category names', () => {
        expect(parseSearchParams(new URLSearchParams('categoryNames=,Games,,+Health+,')).categoryNames)
            .toBe('Games,Health')
    })

    it('writes only what is set, leaving params it does not own alone', () => {
        const written = writeSearchParams(
            new URLSearchParams('utm_source=newsletter&q=old&page=5'),
            {searchTerm: 'new', page: 0, categoryNames: '', published: undefined},
        )

        expect(written.toString()).toBe('utm_source=newsletter&q=new')
    })

    it('goes back to the first page only when the search or a filter changes', () => {
        const current = {page: 4, showcase: 'show-1'}

        expect(applySearchUpdate(current, {page: 7}).page).toBe(7)
        expect(applySearchUpdate(current, {showcase: 'show-2'}).page).toBe(0)
        expect(applySearchUpdate(current, {categoryNames: 'Games'}).page).toBe(0)
        expect(applySearchUpdate(current, {published: 'published'}).page).toBe(0)
        // an empty term is the same search as no term
        expect(applySearchUpdate(current, {searchTerm: ''}).page).toBe(4)
    })

    it('leaves unset fields out of the API request instead of sending "undefined"', () => {
        expect(toApiSearchParams({limit: 15, page: 0, published: undefined, searchTerm: ''}).toString())
            .toBe('limit=15&page=0')
    })
})