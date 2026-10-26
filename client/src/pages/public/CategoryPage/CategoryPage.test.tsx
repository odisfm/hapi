import {render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {CategoryPage} from './CategoryPage.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const fetchMock = vi.fn()

type MockResponse = {ok: boolean, statusText?: string, json: () => Promise<unknown>}

function makeCategory(id: number, name: string, projectCount: number) {
    return {id: `cat-${id}`, name, projectCount}
}

function makeProject(n: number) {
    return {
        id: `id-${n}`,
        versionId: `version-${n}`,
        name: `Project ${n}`,
        subtitle: `Subtitle ${n}`,
        iconUrl: 'example-icon',
        order: String(n),
        slug: `project-${n}`,
        developers: ['Alice'],
        featured: false,
    }
}

function ok(body: unknown): MockResponse {
    return {ok: true, json: async () => body}
}

// the page loads categories and random projects in parallel, so respond by URL
function respondWith({categories, projects}: {categories: MockResponse | Error, projects: MockResponse | Error}) {
    fetchMock.mockImplementation(async (url: string) => {
        const response = url.includes('/category') ? categories : projects
        if (response instanceof Error) throw response
        return response
    })
}

function renderPage() {
    return render(
        <MemoryRouter>
            <CategoryPage/>
        </MemoryRouter>,
    )
}

describe('CategoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
        dispatchModal.mockResolvedValue('ok')
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('shows a spinner while categories load', () => {
        fetchMock.mockReturnValue(new Promise(() => {}))
        const {container} = renderPage()

        expect(screen.getByRole('heading', {level: 1, name: 'Categories'})).toBeInTheDocument()
        expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('scrolls to the top of the page', () => {
        // jsdom doesn't implement document.scrollingElement
        const scroller = {scrollTop: 200}
        Object.defineProperty(document, 'scrollingElement', {configurable: true, value: scroller})
        fetchMock.mockReturnValue(new Promise(() => {}))

        renderPage()

        expect(scroller.scrollTop).toBe(0)
        delete (document as {scrollingElement?: unknown}).scrollingElement
    })

    it('requests categories and a handful of random projects', async () => {
        respondWith({categories: ok({categories: []}), projects: ok({projects: []})})
        renderPage()

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/category'))
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/project/search?orderBy=random&limit=4'),
            expect.objectContaining({credentials: 'omit'}),
        )
    })

    describe('categories', () => {
        it('links each category to a search for it and hides the spinner', async () => {
            respondWith({
                categories: ok({categories: [makeCategory(1, 'Health', 2), makeCategory(2, 'Social Media', 5)]}),
                projects: ok({projects: []}),
            })
            const {container} = renderPage()

            expect(await screen.findByRole('link', {name: 'Health'})).toHaveAttribute('href', '/search?categoryNames=Health')
            expect(screen.getByRole('link', {name: 'Social Media'})).toHaveAttribute('href', '/search?categoryNames=Social%20Media')
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
        })

        it('leaves out categories with no projects', async () => {
            respondWith({
                categories: ok({categories: [makeCategory(1, 'Health', 2), makeCategory(2, 'Empty', 0)]}),
                projects: ok({projects: []}),
            })
            renderPage()

            await screen.findByRole('link', {name: 'Health'})

            expect(screen.queryByText('Empty')).not.toBeInTheDocument()
        })

        it('shows the server error when categories fail to load', async () => {
            respondWith({
                categories: {ok: false, statusText: 'Bad Gateway', json: async () => { throw new SyntaxError() }},
                projects: ok({projects: []}),
            })
            const {container} = renderPage()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Bad Gateway'}))
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
        })
    })

    describe('discover more', () => {
        it('shows the random projects as cards', async () => {
            respondWith({
                categories: ok({categories: []}),
                projects: ok({projects: [makeProject(1), makeProject(2)]}),
            })
            renderPage()

            expect(await screen.findByRole('heading', {level: 2, name: 'Discover more'})).toBeInTheDocument()
            expect(screen.getAllByTestId('hero-card')).toHaveLength(2)
            expect(screen.getByRole('link', {name: /Project 1/})).toHaveAttribute('href', '/project/project-1')
        })

        it('is hidden when there are no projects', async () => {
            respondWith({
                categories: ok({categories: [makeCategory(1, 'Health', 2)]}),
                projects: ok({projects: []}),
            })
            renderPage()

            await screen.findByRole('link', {name: 'Health'})

            expect(screen.queryByRole('heading', {name: 'Discover more'})).not.toBeInTheDocument()
        })

        it('shows an error when projects fail to load', async () => {
            respondWith({
                categories: ok({categories: [makeCategory(1, 'Health', 2)]}),
                projects: new TypeError('Network down'),
            })
            renderPage()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'TypeError: Network down'}))
            expect(await screen.findByRole('link', {name: 'Health'})).toBeInTheDocument()
            expect(screen.queryByRole('heading', {name: 'Discover more'})).not.toBeInTheDocument()
        })

        it('shows the server error when the search is rejected', async () => {
            respondWith({
                categories: ok({categories: []}),
                projects: {ok: false, statusText: 'Bad Request', json: async () => ({error: 'Invalid limit'})},
            })
            renderPage()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Invalid limit'}))
        })
    })
})
