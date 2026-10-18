import {render, screen, waitFor, within} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ShowcaseList} from './ShowcaseList.tsx'

// ShowcaseCard has its own behaviour; show the props the list gives it instead
vi.mock('./ShowcaseCard.tsx', () => ({
    ShowcaseCard: ({id, name, publishedDate, projectCount}: {
        id: string
        name: string
        publishedDate: Date | string | null
        projectCount: number
    }) => (
        <article aria-label={name}>
            <span>id: {id}</span>
            <span>projects: {projectCount}</span>
            <span>published: {publishedDate ? String(publishedDate) : 'never'}</span>
        </article>
    ),
}))

// Keep the card names predictable; the real helper isn't what's under test
vi.mock('@hapi/shared/utils/getShowcaseName', () => ({
    getShowcaseName: (showcase: {name: string}) => showcase.name,
}))

const fetchMock = vi.fn()

function makeShowcase(overrides: Record<string, unknown> = {}) {
    return {
        id: 'show-1',
        name: 'Spring Showcase',
        year: 2025,
        semester: 1,
        publishedDate: null,
        _count: {projects: 3},
        ...overrides,
    }
}

function mockShowcases(showcases: ReturnType<typeof makeShowcase>[]) {
    fetchMock.mockResolvedValue({ok: true, json: async () => ({showcases})})
}

function renderList() {
    return render(
        <MemoryRouter>
            <ShowcaseList/>
        </MemoryRouter>,
    )
}

function cardNames() {
    return screen.getAllByRole('article').map((card) => card.getAttribute('aria-label'))
}

describe('ShowcaseList', () => {
    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('has a showcases heading and a link to create a new showcase', async () => {
        mockShowcases([makeShowcase()])
        renderList()

        expect(screen.getByRole('heading', {name: 'SHOWCASES'})).toBeInTheDocument()
        expect(screen.getByRole('link', {name: /new showcase/i})).toHaveAttribute('href', '/dashboard/showcase/new')
        await screen.findByRole('article')
    })

    describe('loading', () => {
        it('requests every showcase with credentials', async () => {
            mockShowcases([makeShowcase()])
            renderList()
            await screen.findByRole('article')

            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/showcase/all'),
                expect.objectContaining({credentials: 'include'}),
            )
        })

        it('shows no showcases while loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderList()

            expect(screen.queryByRole('article')).not.toBeInTheDocument()
        })
    })

    describe('showcases', () => {
        it('shows a card for each showcase with its details', async () => {
            const date = '2030-01-01T00:00:00.000Z'
            mockShowcases([
                makeShowcase({id: 'show-1', name: 'Spring Showcase', publishedDate: date, _count: {projects: 3}}),
                makeShowcase({id: 'show-2', name: 'Winter Showcase', _count: {projects: 0}}),
            ])
            renderList()
            await screen.findAllByRole('article')

            const spring = within(screen.getByRole('article', {name: 'Spring Showcase'}))
            expect(spring.getByText('id: show-1')).toBeInTheDocument()
            expect(spring.getByText('projects: 3')).toBeInTheDocument()
            expect(spring.getByText(`published: ${date}`)).toBeInTheDocument()

            const winter = within(screen.getByRole('article', {name: 'Winter Showcase'}))
            expect(winter.getByText('id: show-2')).toBeInTheDocument()
            expect(winter.getByText('projects: 0')).toBeInTheDocument()
            expect(winter.getByText('published: never')).toBeInTheDocument()
        })

        it('lists showcases alphabetically by name', async () => {
            mockShowcases([
                makeShowcase({id: 'a', name: 'Winter Showcase'}),
                makeShowcase({id: 'b', name: 'Autumn Showcase'}),
                makeShowcase({id: 'c', name: 'Spring Showcase'}),
            ])
            renderList()
            await screen.findAllByRole('article')

            expect(cardNames()).toEqual(['Autumn Showcase', 'Spring Showcase', 'Winter Showcase'])
        })

        it('shows no cards when there are no showcases', async () => {
            mockShowcases([])
            renderList()

            await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

            expect(screen.queryByRole('article')).not.toBeInTheDocument()
            expect(screen.getByRole('link', {name: /new showcase/i})).toBeInTheDocument()
        })
    })

    describe('when loading fails', () => {
        it('shows no cards when the request fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderList()

            await waitFor(() => expect(console.error).toHaveBeenCalled())

            expect(screen.queryByRole('article')).not.toBeInTheDocument()
            expect(screen.getByRole('link', {name: /new showcase/i})).toBeInTheDocument()
        })

        it('shows no cards when the response is not valid JSON', async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                json: async () => {
                    throw new SyntaxError('Unexpected token')
                },
            })
            renderList()

            await waitFor(() => expect(console.error).toHaveBeenCalled())

            expect(screen.queryByRole('article')).not.toBeInTheDocument()
        })
    })
})