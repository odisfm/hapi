import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, useLocation} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectPreviewType} from '@hapi/shared/types/project'
import {ProjectList} from './ProjectList.tsx'

// FilterSection has its own tests (and its own lists, which would confuse the list assertions here);
// stub it with something that picks a category through the URL the same way
vi.mock('./FilterSection.tsx', async () => {
    const {useProjectSearchParams} =
        await vi.importActual<typeof import('./useProjectSearchParams.ts')>('./useProjectSearchParams.ts')
    return {
        FilterSection: ({filters}: {filters: string[]}) => {
            const [, updateQuery] = useProjectSearchParams()
            return (
                <button type="button" data-filters={filters.join(',')} onClick={() => updateQuery({categoryNames: 'Games'})}>
                    Pick games category
                </button>
            )
        },
    }
})

type MockApiOptions = {
    projects?: ProjectPreviewType[]
    totalResults?: number
    searchOk?: boolean
}

function makeProjects(count: number): ProjectPreviewType[] {
    return Array.from({length: count}, (_, i) => ({
        id: `id-${i + 1}`,
        name: `Project ${i + 1}`,
        subtitle: 'A project subtitle',
        iconUrl: 'example-icon',
        order: String(i + 1),
        slug: `project-${i + 1}`,
        developers: ['Alice'],
        featured: false,
        versionId: `aaa-${i+1}`
    }))
}

function jsonResponse(body: unknown, ok = true) {
    return {ok, json: async () => body}
}

function mockApi({projects = [], totalResults = projects.length, searchOk = true}: MockApiOptions = {}) {
    const fetchMock = vi.fn(async (url: string) => {
        if (url.includes('/project/search')) {
            return jsonResponse({projects, info: {totalResults}}, searchOk)
        }
        if (url.includes('/category')) return jsonResponse({categories: []})
        if (url.includes('/showcase/all')) return jsonResponse({showcases: []})
        throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

function lastSearchParams(fetchMock: ReturnType<typeof mockApi>) {
    const urls = fetchMock.mock.calls
        .map(([url]) => url)
        .filter((url) => url.includes('/project/search'))
    return new URLSearchParams(urls[urls.length - 1].split('?')[1])
}

function LocationProbe() {
    return <div data-testid="location">{useLocation().search}</div>
}

/** the address bar's query string, as shown */
function search() {
    return screen.getByTestId('location').textContent
}

function renderList(path = '/dashboard') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <ProjectList/>
            <LocationProbe/>
        </MemoryRouter>,
    )
}

describe('ProjectList', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('links to the new project page', async () => {
        mockApi({projects: makeProjects(1)})
        renderList()

        expect(screen.getByRole('link', {name: /new project/i})).toHaveAttribute('href', '/dashboard/project/new')
        await screen.findByText('1 project matching filters.')
    })

    it('offers the showcase, category and published filters', async () => {
        mockApi({projects: makeProjects(1)})
        renderList()
        await screen.findByText('1 project matching filters.')

        expect(screen.getByRole('button', {name: 'Pick games category'}))
            .toHaveAttribute('data-filters', 'showcase,category,published')
    })

    describe('loading', () => {
        it('shows a loading message until the projects arrive', async () => {
            mockApi({projects: makeProjects(3)})
            renderList()

            expect(screen.getByText('Loading...')).toBeInTheDocument()

            await screen.findByText('3 projects found.')
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        it('requests the first page of fifteen projects', async () => {
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderList()

            await screen.findByText('3 projects found.')

            expect(lastSearchParams(fetchMock).get('limit')).toBe('15')
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
        })

        it('starts from the search in the address', async () => {
            const fetchMock = mockApi({projects: makeProjects(10), totalResults: 25})
            renderList('/dashboard?q=maps&page=2&published=unpublished')

            await screen.findByText('25 projects found, showing 16-25.')

            expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('maps')
            expect(lastSearchParams(fetchMock).get('page')).toBe('1')
            expect(lastSearchParams(fetchMock).get('published')).toBe('unpublished')
            expect(screen.getByRole('textbox')).toHaveValue('maps')
        })
    })

    describe('results', () => {
        it('lists each project returned', async () => {
            mockApi({projects: makeProjects(3)})
            renderList()

            await screen.findByText('3 projects found.')

            expect(screen.getAllByRole('listitem')).toHaveLength(3)
            expect(screen.getByRole('link', {name: 'Project 1'})).toBeInTheDocument()
            expect(screen.getByRole('link', {name: 'Project 3'})).toBeInTheDocument()
        })

        it('says "1 project matching filters." for a single result', async () => {
            mockApi({projects: makeProjects(1)})
            renderList()

            expect(await screen.findByText('1 project matching filters.')).toBeInTheDocument()
        })

        it('shows which results are visible when there is more than one page', async () => {
            mockApi({projects: makeProjects(15), totalResults: 25})
            renderList()

            expect(await screen.findByText('25 projects found, showing 1-15.')).toBeInTheDocument()
        })

        it('shows the empty state and no list when nothing matches', async () => {
            mockApi({projects: [], totalResults: 0})
            renderList()

            await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

            expect(screen.getAllByText('No projects matching filters.')).toHaveLength(2)
            expect(screen.queryByRole('list')).not.toBeInTheDocument()
        })

        it('shows the empty state and no list when the search request fails', async () => {
            mockApi({searchOk: false})
            renderList()

            await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

            expect(screen.getByText('No projects matching filters.')).toBeInTheDocument()
            expect(screen.queryByRole('list')).not.toBeInTheDocument()
        })
    })

    describe('pagination', () => {
        it('shows a single page button, above and below the list, when everything fits on one page', async () => {
            mockApi({projects: makeProjects(3)})
            renderList()

            await screen.findByText('3 projects found.')

            expect(screen.getAllByRole('button', {name: '1'})).toHaveLength(2)
            expect(screen.queryByRole('button', {name: '2'})).not.toBeInTheDocument()
        })

        it('loads and describes the next page when a page button is clicked, and puts it in the address', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 25})
            renderList()
            await screen.findByText('25 projects found, showing 1-15.')

            await user.click(screen.getAllByRole('button', {name: '2'})[0])

            expect(await screen.findByText('25 projects found, showing 16-25.')).toBeInTheDocument()
            expect(lastSearchParams(fetchMock).get('page')).toBe('1')
            expect(search()).toBe('?page=2')
        })
    })

    describe('searching', () => {
        it('searches for the typed term and puts it in the address', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(3)})
            renderList()
            await screen.findByText('3 projects found.')

            await user.type(screen.getByRole('textbox'), 'maps')
            await user.click(screen.getByRole('button', {name: 'Search'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('maps'))
            expect(search()).toBe('?q=maps')
        })

        it('goes back to the first page when the search term changes', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 25})
            renderList()
            await screen.findByText('25 projects found, showing 1-15.')
            await user.click(screen.getAllByRole('button', {name: '2'})[0])
            await screen.findByText('25 projects found, showing 16-25.')

            await user.type(screen.getByRole('textbox'), 'maps')
            await user.click(screen.getByRole('button', {name: 'Search'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('searchTerm')).toBe('maps'))
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
            expect(search()).toBe('?q=maps')
        })
    })

    describe('filtering', () => {
        it('searches with the chosen filter and returns to the first page', async () => {
            const user = userEvent.setup()
            const fetchMock = mockApi({projects: makeProjects(15), totalResults: 25})
            renderList()
            await screen.findByText('25 projects found, showing 1-15.')
            await user.click(screen.getAllByRole('button', {name: '2'})[0])
            await screen.findByText('25 projects found, showing 16-25.')

            await user.click(screen.getByRole('button', {name: 'Pick games category'}))

            await waitFor(() => expect(lastSearchParams(fetchMock).get('categoryNames')).toBe('Games'))
            expect(lastSearchParams(fetchMock).get('page')).toBe('0')
            expect(search()).toBe('?categoryNames=Games')
        })
    })
})