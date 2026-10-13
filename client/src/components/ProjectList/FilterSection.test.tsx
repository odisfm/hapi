import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, useLocation} from 'react-router'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {Category, Showcase} from '@hapi/shared/prisma/client'
import {FilterSection, type FilterType} from './FilterSection.tsx'

vi.mock('@hapi/shared/utils/getShowcaseName', () => ({
    getShowcaseName: (showcase: {name: string}) => showcase.name,
}))

const showcases = [
    {id: 'show-1', name: 'Spring Showcase'},
    {id: 'show-2', name: 'Autumn Showcase'},
] as unknown as Showcase[]

const categories = [
    {id: 'cat-1', name: 'Games'},
    {id: 'cat-2', name: 'Health'},
    {id: 'cat-3', name: 'Education'},
] as unknown as Category[]

const ALL_FILTERS: FilterType[] = ['showcase', 'category', 'published']

function LocationProbe() {
    const location = useLocation()
    return <div data-testid="location" data-key={location.key}>{location.search}</div>
}

function renderFilters(
    path = '/projects',
    options: {filters?: FilterType[]; showcases?: Showcase[]; categories?: Category[]; showTitle?: boolean} = {},
) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <FilterSection
                filters={options.filters ?? ALL_FILTERS}
                showcases={options.showcases ?? showcases}
                categories={options.categories ?? categories}
                showTitle={options.showTitle}
            />
            <LocationProbe/>
        </MemoryRouter>,
    )
}

/** the address bar's query string, as shown */
function search() {
    return screen.getByTestId('location').textContent
}

function params() {
    return new URLSearchParams(search() ?? '')
}

describe('FilterSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
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

        it('offers All, Published and Unpublished', () => {
            renderFilters()

            expect(screen.getByRole('button', {name: 'All'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Published'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Unpublished'})).toBeInTheDocument()
        })

        it('offers only the published options when there are no showcases or categories', () => {
            renderFilters('/projects', {showcases: [], categories: []})

            expect(screen.getAllByRole('button')).toHaveLength(3)
        })

        it('shows only the filters it is given, in the order given', () => {
            renderFilters('/projects', {filters: ['category', 'showcase']})

            expect(screen.queryByRole('button', {name: 'Published'})).not.toBeInTheDocument()
            const category = screen.getByText('Category')
            const showcase = screen.getByText('Showcase')
            expect(category.compareDocumentPosition(showcase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        })

        it('shows a "Filter" title only when asked to', () => {
            const {unmount} = renderFilters()
            expect(screen.queryByText('Filter')).not.toBeInTheDocument()
            unmount()

            renderFilters('/projects', {showTitle: true})
            expect(screen.getByText('Filter')).toBeInTheDocument()
        })

        it('does not change the address until an option is clicked', () => {
            renderFilters('/projects?q=maps')

            expect(search()).toBe('?q=maps')
            expect(screen.getByTestId('location')).toHaveAttribute('data-key', 'default')
        })
    })

    describe('clear all', () => {
        it('is hidden when no filter is applied', () => {
            renderFilters('/projects?q=maps')

            expect(screen.queryByRole('button', {name: 'clear all'})).not.toBeInTheDocument()
        })

        it.each([
            ['a showcase', 'showcase=show-1'],
            ['a category', 'categoryNames=Games'],
            ['a published filter', 'published=published'],
        ])('is shown when %s is applied', (_label, filter) => {
            renderFilters(`/projects?${filter}`)

            expect(screen.getByRole('button', {name: 'clear all'})).toBeInTheDocument()
        })

        it('is hidden when the only filter applied is one it does not show', () => {
            renderFilters('/projects?published=published', {filters: ['showcase', 'category']})

            expect(screen.queryByRole('button', {name: 'clear all'})).not.toBeInTheDocument()
        })

        it('removes the filters, keeps the search term and goes back to the first page', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?q=maps&page=3&showcase=show-1&categoryNames=Games,Health&published=published')

            await user.click(screen.getByRole('button', {name: 'clear all'}))

            expect(search()).toBe('?q=maps')
        })

        it('leaves filters it does not show alone', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?showcase=show-1&published=published', {filters: ['showcase', 'category']})

            await user.click(screen.getByRole('button', {name: 'clear all'}))

            expect(search()).toBe('?published=published')
        })
    })

    describe('choosing a showcase', () => {
        it('searches within that showcase', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?q=maps')

            await user.click(screen.getByRole('button', {name: 'Autumn Showcase'}))

            expect(params().get('showcase')).toBe('show-2')
            expect(params().get('q')).toBe('maps')
        })

        it('goes back to the first page', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?page=4')

            await user.click(screen.getByRole('button', {name: 'Spring Showcase'}))

            expect(params().has('page')).toBe(false)
        })

        it('leaves the address alone when the showcase is already selected', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?showcase=show-1&page=4')

            await user.click(screen.getByRole('button', {name: 'Spring Showcase'}))

            expect(search()).toBe('?showcase=show-1&page=4')
            expect(screen.getByTestId('location')).toHaveAttribute('data-key', 'default')
        })
    })

    describe('choosing categories', () => {
        it('selects the first category by name', async () => {
            const user = userEvent.setup()
            renderFilters()

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(search()).toBe('?categoryNames=Games')
        })

        it('adds another category to those already selected, in one comma-joined param', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?categoryNames=Games')

            await user.click(screen.getByRole('button', {name: 'Health'}))

            expect(search()).toBe('?categoryNames=Games,Health')
        })

        it('removes a category that is already selected and keeps the others in order', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?categoryNames=Games,Health,Education')

            await user.click(screen.getByRole('button', {name: 'Health'}))

            expect(params().get('categoryNames')).toBe('Games,Education')
        })

        it('removes the param when the only selected category is removed', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?categoryNames=Games')

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(params().has('categoryNames')).toBe(false)
        })

        it('keeps the rest of the search and goes back to the first page', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?q=maps&showcase=show-1&page=3')

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(search()).toBe('?q=maps&categoryNames=Games&showcase=show-1')
        })
    })

    describe('choosing a published status', () => {
        it('filters to published projects', async () => {
            const user = userEvent.setup()
            renderFilters()

            await user.click(screen.getByRole('button', {name: 'Published'}))

            expect(params().get('published')).toBe('published')
        })

        it('filters to unpublished projects', async () => {
            const user = userEvent.setup()
            renderFilters()

            await user.click(screen.getByRole('button', {name: 'Unpublished'}))

            expect(params().get('published')).toBe('unpublished')
        })

        it('shows all projects again when All is chosen', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?published=published')

            await user.click(screen.getByRole('button', {name: 'All'}))

            expect(params().has('published')).toBe(false)
        })

        it('keeps the rest of the search and goes back to the first page', async () => {
            const user = userEvent.setup()
            renderFilters('/projects?q=maps&categoryNames=Games&page=3')

            await user.click(screen.getByRole('button', {name: 'Published'}))

            expect(search()).toBe('?q=maps&categoryNames=Games&published=published')
        })
    })
})