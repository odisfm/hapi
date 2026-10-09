import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectPreviewType} from '@hapi/shared/types/project'
import SearchResultsPage from './SearchResultsPage.tsx'

// PublicFilterSection has its own behaviour; stub it so we can still drive a filter change
vi.mock('../components/ProjectList/PublicFilterSection.tsx', () => ({
    PublicFilterSection: ({searchQuery, setSearchQuery}: {
        searchQuery: Record<string, unknown>
        setSearchQuery: (query: Record<string, unknown>) => void
    }) => (
        <button type="button" onClick={() => setSearchQuery({...searchQuery, category: 'games'})}>
            Pick games category
        </button>
    ),
}))

type MockApiOptions = {
    projects?: ProjectPreviewType[]
    totalResults?: number
    searchOk?: boolean
    categories?: {id: string; name: string}[]
}

function makeProjects(count: number): ProjectPreviewType[] {
    return Array.from({length: count}, (_, i) => ({
        id: `id-${i + 1}`,
        name: `Project ${i + 1}`,
        subtitle: `Subtitle ${i + 1}`,
        iconUrl: 'example-icon',
        order: String(i + 1),
        slug: `project-${i + 1}`,
        developers: ['Alice'],
        featured: false,
    }))
}

function jsonResponse(body: unknown, ok = true) {
    return {ok, json: async () => body}
}

function mockApi({projects = [], totalResults = projects.length, searchOk = true, categories = []}: MockApiOptions = {}) {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        void init
        if (url.includes('/project/search')) {
            return jsonResponse({projects, info: {totalResults}}, searchOk)
        }
        if (url.includes('/category')) return jsonResponse({categories})
        if (url.includes('/showcase/all')) return jsonResponse({showcases: []})
        throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

function searchCalls(fetchMock: ReturnType<typeof mockApi>) {
    return fetchMock.mock.calls.filter(([url]) => url.includes('/project/search'))
}

function lastSearchParams(fetchMock: ReturnType<typeof mockApi>) {
    const calls = searchCalls(fetchMock)
    return new URLSearchParams(calls[calls.length - 1][0].split('?')[1])
}

function renderPage(path = '/search') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SearchResultsPage/>
        </MemoryRouter>,
    )
}

describe('SearchResultsPage', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('shows a loading message, then the number of results', async () => {
            mockApi({projects: makeProjects(3)})
            renderPage()

            expect(screen.getByText('Loading...')).toBeInTheDocument()

            expect(await screen.findByText('3 results found')).toBeInTheDocument()
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        it('requests the first page of fifteen results without credentials', async () => {
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            expect(lastSearchParams(fetchMock).get('limit')).toBe('15')
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
            expect(searchCalls(fetchMock)[0][1]).toEqual(expect.objectContaining({credentials: 'omit'}))
        })
    })

    describe('search term from the URL', () => {
        it('searches for the term in the address and shows it as a heading', async () => {
            const fetchMock = mockApi({projects: makeProjects(2)})
            renderPage('/search?q=cats')
            await screen.findByText('2 results found')

            expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('cats')
            const heading = screen.getByRole('heading', {name: /search results for/i})
            expect(heading).toHaveTextContent('cats')
        })

        it('shows no heading when there is no search term', async () => {
            mockApi({projects: makeProjects(2)})
            renderPage('/search')
            await screen.findByText('2 results found')

            expect(screen.queryByRole('heading', {level: 1})).not.toBeInTheDocument()
        })
    })

    describe('results', () => {
        it('shows each project as a link to its page', async () => {
            mockApi({projects: makeProjects(3)})
            renderPage()

            expect(await screen.findByRole('link', {name: /Project 1/})).toHaveAttribute('href', '/project/project-1')
            expect(screen.getByRole('link', {name: /Project 2/})).toHaveAttribute('href', '/project/project-2')
            expect(screen.getByRole('link', {name: /Project 3/})).toHaveAttribute('href', '/project/project-3')
            expect(screen.queryByText('No applications match your results')).not.toBeInTheDocument()
        })

        it('shows a message and no projects when nothing matches', async () => {
            mockApi({projects: [], totalResults: 0})
            renderPage()

            expect(await screen.findByText('No applications match your results')).toBeInTheDocument()
            expect(screen.getByText('0 results found')).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('shows the same message when the search request fails', async () => {
            mockApi({searchOk: false})
            renderPage()

            expect(await screen.findByText('No applications match your results')).toBeInTheDocument()
        })
    })

    describe('pagination', () => {
        it('shows a single page button when everything fits on one page', async () => {
            mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            expect(screen.getByRole('button', {name: '1'})).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: '2'})).not.toBeInTheDocument()
        })

        it('shows one button per page of fifteen', async () => {
            mockApi({projects: makeProjects(15), totalResults: 40})
            renderPage()
            await screen.findByText('40 results found')

            expect(screen.getByRole('button', {name: '3'})).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: '4'})).not.toBeInTheDocument()
        })

        it('loads the chosen page', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 40})
            renderPage()
            await screen.findByText('40 results found')

            await user.click(screen.getByRole('button', {name: '2'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('page')).toBe('1'))
        })
    })

    describe('searching', () => {
        it('searches for the typed term and shows it as a heading', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            await user.type(screen.getByRole('textbox'), 'maps')
            await user.click(screen.getByRole('button', {name: 'Search'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('maps'))
            expect(await screen.findByRole('heading', {name: /search results for/i})).toHaveTextContent('maps')
        })

        it('searches when the user presses Enter', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            await user.type(screen.getByRole('textbox'), 'robots{Enter}')

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('robots'))
        })

        it('goes back to the first page when the term changes', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 40})
            renderPage()
            await screen.findByText('40 results found')
            await user.click(screen.getByRole('button', {name: '2'}))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('page')).toBe('1'))

            await user.type(screen.getByRole('textbox'), 'maps')
            await user.click(screen.getByRole('button', {name: 'Search'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('maps'))
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
        })
    })

    describe('filters', () => {
        it('are hidden until the Filter button is clicked, and hidden again when clicked twice', async () => {
            const user = userEvent.setup()
            mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            const filterButton = screen.getByRole('button', {name: 'Filter'})
            expect(filterButton).toHaveAttribute('aria-expanded', 'false')
            expect(screen.queryByRole('button', {name: 'Pick games category'})).not.toBeInTheDocument()

            await user.click(filterButton)
            expect(filterButton).toHaveAttribute('aria-expanded', 'true')
            expect(screen.getByRole('button', {name: 'Pick games category'})).toBeInTheDocument()

            await user.click(filterButton)
            expect(filterButton).toHaveAttribute('aria-expanded', 'false')
            expect(screen.queryByRole('button', {name: 'Pick games category'})).not.toBeInTheDocument()
        })

        it('shows fourteen results per page while open and fifteen when closed', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            await user.click(screen.getByRole('button', {name: 'Filter'}))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('limit')).toBe('14'))

            await user.click(screen.getByRole('button', {name: 'Filter'}))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('limit')).toBe('15'))
        })

        it('searches with the chosen filter from the first page', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(14), totalResults: 40})
            renderPage()
            await screen.findByText('40 results found')
            await user.click(screen.getByRole('button', {name: 'Filter'}))

            await user.click(screen.getByRole('button', {name: 'Pick games category'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('category')).toBe('games'))
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
        })

        it('names the filter in the message when nothing matches it', async () => {
            const user = userEvent.setup()
            mockApi({projects: [], totalResults: 0, categories: [{id: 'games', name: 'Games'}]})
            renderPage()
            await screen.findByText('No applications match your results')

            await user.click(screen.getByRole('button', {name: 'Filter'}))
            await user.click(screen.getByRole('button', {name: 'Pick games category'}))

            expect(await screen.findByText('No Games applications match your filters')).toBeInTheDocument()
        })
    })
})