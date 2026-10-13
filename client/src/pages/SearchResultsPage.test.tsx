import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, useLocation, useNavigate} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectPreviewType} from '@hapi/shared/types/project'
import SearchResultsPage from './SearchResultsPage.tsx'

type MockApiOptions = {
    projects?: ProjectPreviewType[]
    totalResults?: number
    searchOk?: boolean
    categories?: {id: string; name: string}[]
}

const CATEGORIES = [{id: 'cat-1', name: 'Games'}, {id: 'cat-2', name: 'Health'}]

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
        versionId: `v-${i + 1}`,
    }))
}

function jsonResponse(body: unknown, ok = true) {
    return {ok, json: async () => body}
}

function mockApi({projects = [], totalResults = projects.length, searchOk = true, categories = CATEGORIES}: MockApiOptions = {}) {
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

function LocationProbe() {
    const location = useLocation()
    const navigate = useNavigate()
    return <>
        <div data-testid="location">{location.search}</div>
        <button type="button" onClick={() => navigate(-1)}>Go back</button>
    </>
}

/** the address bar's query string, as shown */
function search() {
    return screen.getByTestId('location').textContent
}

function renderPage(path = '/search') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SearchResultsPage/>
            <LocationProbe/>
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

    describe('search from the URL', () => {
        it('searches for the term in the address, shows it as a heading and fills the search box', async () => {
            const fetchMock = mockApi({projects: makeProjects(2)})
            renderPage('/search?q=cats')
            await screen.findByText('2 results found')

            expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('cats')
            const heading = screen.getByRole('heading', {name: /search results for/i})
            expect(heading).toHaveTextContent('cats')
            expect(screen.getByRole('textbox')).toHaveValue('cats')
        })

        it('shows no heading when there is no search term', async () => {
            mockApi({projects: makeProjects(2)})
            renderPage('/search')
            await screen.findByText('2 results found')

            expect(screen.queryByRole('heading', {level: 1})).not.toBeInTheDocument()
        })

        it('searches with the page and categories in the address', async () => {
            const fetchMock = mockApi({projects: makeProjects(14), totalResults: 40})
            renderPage('/search?categoryNames=Games,Health&page=2')
            await screen.findByText('40 results found')

            expect(lastSearchParams(fetchMock).get('categoryNames')).toBe('Games,Health')
            expect(lastSearchParams(fetchMock).get('page')).toBe('1')
            expect(lastSearchParams(fetchMock).has('categoryIds')).toBe(false)
        })

        it('runs the previous search again when the user goes back', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage('/search?q=cats')
            await screen.findByText('3 results found')
            await user.clear(screen.getByRole('textbox'))
            await user.type(screen.getByRole('textbox'), 'dogs{Enter}')
            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('dogs'))

            await user.click(screen.getByRole('button', {name: 'Go back'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('cats'))
            expect(search()).toBe('?q=cats')
            expect(screen.getByRole('textbox')).toHaveValue('cats')
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

        it('shows one button per page of fifteen', async () => {
            mockApi({projects: makeProjects(15), totalResults: 40})
            renderPage()
            await screen.findByText('40 results found')

            expect(screen.getByRole('button', {name: '3'})).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: '4'})).not.toBeInTheDocument()
        })

        it('loads the chosen page and puts it in the address', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 40})
            renderPage('/search?q=cats')
            await screen.findByText('40 results found')

            await user.click(screen.getByRole('button', {name: '2'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('page')).toBe('1'))
            expect(search()).toBe('?q=cats&page=2')
        })
    })

    describe('searching', () => {
        it('searches for the typed term, shows it as a heading and puts it in the address', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            await user.type(screen.getByRole('textbox'), 'maps')
            await user.click(screen.getByRole('button', {name: 'Search'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('maps'))
            expect(await screen.findByRole('heading', {name: /search results for/i})).toHaveTextContent('maps')
            expect(search()).toBe('?q=maps')
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
            expect(search()).toBe('?q=maps')
        })

        it('clears the search, but not the filters, with the cancel button', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage('/search?q=cats&categoryNames=Games')
            await screen.findByText('3 results found')
            const callsBefore = searchCalls(fetchMock).length

            // the cancel button is the only one without a name
            await user.click(screen.getByRole('button', {name: ''}))

            await waitFor(() => expect(searchCalls(fetchMock).length).toBe(callsBefore + 1))
            expect(lastSearchParams(fetchMock).has('searchTerm')).toBe(false)
            expect(search()).toBe('?categoryNames=Games')
            expect(screen.getByRole('textbox')).toHaveValue('')
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
            expect(screen.queryByRole('button', {name: 'Games'})).not.toBeInTheDocument()

            await user.click(filterButton)
            expect(filterButton).toHaveAttribute('aria-expanded', 'true')
            expect(screen.getByRole('button', {name: 'Games'})).toBeInTheDocument()

            await user.click(filterButton)
            expect(filterButton).toHaveAttribute('aria-expanded', 'false')
            expect(screen.queryByRole('button', {name: 'Games'})).not.toBeInTheDocument()
        })

        it('offers categories and showcases but not the published filter', async () => {
            const user = userEvent.setup()
            mockApi({projects: makeProjects(3)})
            renderPage()
            await screen.findByText('3 results found')

            await user.click(screen.getByRole('button', {name: 'Filter'}))

            expect(screen.getByText('Showcase')).toBeInTheDocument()
            expect(screen.getByText('Category')).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Published'})).not.toBeInTheDocument()
        })

        it('start open when the address already has a filter', async () => {
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderPage('/search?categoryNames=Games')
            await screen.findByText('3 results found')

            expect(screen.getByRole('button', {name: 'Filter'})).toHaveAttribute('aria-expanded', 'true')
            expect(lastSearchParams(fetchMock).get('limit')).toBe('14')
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

        it('leaves the address alone when opening and closing them keeps the same page', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 100})
            // results 46-60; with fourteen per page they're still on page 4 (43-56)
            renderPage('/search?q=cats&page=4')
            await screen.findByText('100 results found')

            await user.click(screen.getByRole('button', {name: 'Filter'}))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('limit')).toBe('14'))
            expect(search()).toBe('?q=cats&page=4')

            await user.click(screen.getByRole('button', {name: 'Filter'}))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('limit')).toBe('15'))
            expect(search()).toBe('?q=cats&page=4')
            expect(lastSearchParams(fetchMock).get('page')).toBe('3')
        })

        it('moves to the page that keeps the same results in view, with one search per toggle', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 300})
            // results 211-225; with fourteen per page they're on page 16 (211-224)
            renderPage('/search?page=15')
            await screen.findByText('300 results found')
            let callsBefore = searchCalls(fetchMock).length

            await user.click(screen.getByRole('button', {name: 'Filter'}))

            await waitFor(() => expect(search()).toBe('?page=16'))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('page')).toBe('15'))
            expect(searchCalls(fetchMock).length).toBe(callsBefore + 1)
            callsBefore = searchCalls(fetchMock).length

            await user.click(screen.getByRole('button', {name: 'Filter'}))

            await waitFor(() => expect(search()).toBe('?page=15'))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('page')).toBe('14'))
            expect(searchCalls(fetchMock).length).toBe(callsBefore + 1)
        })

        it('searches with the chosen category from the first page and puts it in the address', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 40})
            renderPage()
            await screen.findByText('40 results found')
            await user.click(screen.getByRole('button', {name: '2'}))
            await waitFor(() => expect(lastSearchParams(fetchMock).get('page')).toBe('1'))
            await user.click(screen.getByRole('button', {name: 'Filter'}))

            await user.click(screen.getByRole('button', {name: 'Games'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('categoryNames')).toBe('Games'))
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
            expect(search()).toBe('?categoryNames=Games')
        })

        it('names the filter in the message when nothing matches it', async () => {
            const user = userEvent.setup()
            mockApi({projects: [], totalResults: 0})
            renderPage()
            await screen.findByText('No applications match your results')

            await user.click(screen.getByRole('button', {name: 'Filter'}))
            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(await screen.findByText('No Games applications match your filters')).toBeInTheDocument()
        })
    })
})