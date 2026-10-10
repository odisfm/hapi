import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {Category, Showcase} from '@hapi/shared/prisma/client'
import type {ProjectSearchQuery} from '@hapi/shared/types/apiRequests'
import {PublicFilterSection} from './PublicFilterSection.tsx'

vi.mock('@hapi/shared/utils/getShowcaseName', () => ({
    getShowcaseName: (showcase: {name: string}) => showcase.name,
}))

const setSearchQuery = vi.fn()

const showcases = [
    {id: 'show-1', name: 'Spring Showcase'},
    {id: 'show-2', name: 'Autumn Showcase'},
] as unknown as Showcase[]

const categories = [
    {id: 'cat-1', name: 'Games'},
    {id: 'cat-2', name: 'Health'},
    {id: 'cat-3', name: 'Education'},
] as unknown as Category[]

function makeQuery(overrides: Partial<ProjectSearchQuery> = {}) {
    return {limit: 10, page: 0, ...overrides} as ProjectSearchQuery
}

function renderFilters(
    query: ProjectSearchQuery = makeQuery(),
    options: {showcases?: Showcase[]; categories?: Category[]} = {},
) {
    return render(
        <PublicFilterSection
            searchQuery={query}
            setSearchQuery={setSearchQuery}
            showcases={options.showcases ?? showcases}
            categories={options.categories ?? categories}
        />,
    )
}

function lastQuery(): ProjectSearchQuery {
    const calls = setSearchQuery.mock.calls
    return calls[calls.length - 1][0]
}

function selectedCategories(query: ProjectSearchQuery) {
    return (query.category ?? '').split(',').filter(Boolean)
}

describe('PublicFilterSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('options', () => {
        it('is a navigation landmark', () => {
            renderFilters()

            expect(screen.getByRole('navigation')).toBeInTheDocument()
        })

        it('offers a button for every showcase', () => {
            renderFilters()

            expect(screen.getByRole('button', {name: 'Spring Showcase'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Autumn Showcase'})).toBeInTheDocument()
        })

        it('offers a button for every category', () => {
            renderFilters()

            expect(screen.getByRole('button', {name: 'Games'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Health'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Education'})).toBeInTheDocument()
        })

        it('does not offer published filters', () => {
            renderFilters()

            expect(screen.queryByRole('button', {name: 'All'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Published'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Unpublished'})).not.toBeInTheDocument()
        })

        it('offers no filter options when there are no showcases or categories', () => {
            renderFilters(makeQuery(), {showcases: [], categories: []})

            expect(screen.queryAllByRole('button')).toHaveLength(0)
        })

        it('does not change anything until an option is clicked', () => {
            renderFilters()

            expect(setSearchQuery).not.toHaveBeenCalled()
        })
    })

    describe('clear all', () => {
        it('is hidden when no filter is applied', () => {
            renderFilters(makeQuery())

            expect(screen.queryByRole('button', {name: 'clear all'})).not.toBeInTheDocument()
        })

        it.each([
            ['a showcase', {showcase: 'show-1'}],
            ['a category', {category: 'cat-1'}],
        ] as [string, Partial<ProjectSearchQuery>][])('is shown when %s is applied', (_label, filter) => {
            renderFilters(makeQuery(filter))

            expect(screen.getByRole('button', {name: 'clear all'})).toBeInTheDocument()
        })

        it('removes the filters and keeps the rest of the search', async () => {
            const user = userEvent.setup()
            renderFilters(
                makeQuery({
                    page: 2,
                    searchTerm: 'maps',
                    showcase: 'show-1',
                    category: 'cat-1,cat-2',
                }),
            )

            await user.click(screen.getByRole('button', {name: 'clear all'}))

            expect(setSearchQuery).toHaveBeenCalledTimes(1)
            expect(setSearchQuery).toHaveBeenCalledWith({limit: 10, page: 2, searchTerm: 'maps'})
        })
    })

    describe('choosing a showcase', () => {
        it('searches within that showcase', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery({searchTerm: 'maps'}))

            await user.click(screen.getByRole('button', {name: 'Autumn Showcase'}))

            expect(setSearchQuery).toHaveBeenCalledTimes(1)
            expect(setSearchQuery).toHaveBeenCalledWith(
                expect.objectContaining({showcase: 'show-2', searchTerm: 'maps', limit: 10}),
            )
        })

        it('goes back to the first page', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery({page: 3}))

            await user.click(screen.getByRole('button', {name: 'Spring Showcase'}))

            expect(lastQuery().page).toBe(0)
        })
    })

    describe('choosing categories', () => {
        it('selects the first category', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery())

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(setSearchQuery).toHaveBeenCalledTimes(1)
            expect(selectedCategories(lastQuery())).toEqual(['cat-1'])
        })

        it('adds another category to those already selected', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery({category: 'cat-1'}))

            await user.click(screen.getByRole('button', {name: 'Health'}))

            expect(selectedCategories(lastQuery())).toEqual(['cat-1', 'cat-2'])
        })

        it('removes a category that is already selected and keeps the others in order', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery({category: 'cat-1,cat-2,cat-3'}))

            await user.click(screen.getByRole('button', {name: 'Health'}))

            expect(selectedCategories(lastQuery())).toEqual(['cat-1', 'cat-3'])
        })

        it('can remove the only selected category', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery({category: 'cat-1'}))

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(selectedCategories(lastQuery())).toEqual([])
        })

        it('keeps the rest of the search', async () => {
            const user = userEvent.setup()
            renderFilters(makeQuery({searchTerm: 'maps', showcase: 'show-1'}))

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(lastQuery()).toEqual(
                expect.objectContaining({searchTerm: 'maps', showcase: 'show-1', limit: 10}),
            )
        })
    })
})
