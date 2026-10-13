import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import HomePage from './HomePage.tsx'

function makeProject(n: number) {
    return {
        id: `id-${n}`,
        name: `Project ${n}`,
        subtitle: `Subtitle ${n}`,
        iconUrl: 'example-icon',
        order: String(n),
        slug: `project-${n}`,
        developers: ['Alice'],
        featured: true,
    }
}

function featuredResponse(projectCount: number, heroIds: string[] = []) {
    return {
        ok: true,
        json: async () => ({
            projects: Array.from({length: projectCount}, (_, i) => makeProject(i + 1)),
            info: {totalResults: projectCount, heroIds},
        }),
    }
}

function renderPage() {
    return render(
        <MemoryRouter>
            <HomePage/>
        </MemoryRouter>,
    )
}

describe('HomePage', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        // the page logs its project split; keep test output clean
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('introduces the hub', async () => {
        fetchMock.mockResolvedValue(featuredResponse(0))
        renderPage()

        expect(screen.getByRole('heading', {level: 1, name: /hub for apple platform innovation/i})).toBeInTheDocument()
        expect(screen.getByRole('heading', {name: 'FEATURED PROJECTS'})).toBeInTheDocument()
        await screen.findByText('No projects found.')
    })

    it('links to the full project search', async () => {
        fetchMock.mockResolvedValue(featuredResponse(0))
        renderPage()

        await screen.getByRole('button', { name: /view more/i }).click()
        await screen.findByText('No projects found.')
    })

    describe('loading featured projects', () => {
        it('requests the featured projects without credentials', async () => {
            fetchMock.mockResolvedValue(featuredResponse(0))
            renderPage()

            await screen.findByText('No projects found.')

            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/project/featured'),
                expect.objectContaining({credentials: 'omit'}),
            )
        })

        it('does not show the empty message or an error while loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderPage()

            expect(screen.queryByText('No projects found.')).not.toBeInTheDocument()
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        it('cancels the request when the page is left', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            const {unmount} = renderPage()
            const signal = fetchMock.mock.calls[0][1].signal as AbortSignal

            expect(signal.aborted).toBe(false)

            unmount()

            expect(signal.aborted).toBe(true)
        })
    })

    describe('when projects load', () => {
        it('shows a message when there are no featured projects', async () => {
            fetchMock.mockResolvedValue(featuredResponse(0))
            renderPage()

            expect(await screen.findByText('No projects found.')).toBeInTheDocument()
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        it('shows each project as a link to its page', async () => {
            fetchMock.mockResolvedValue(featuredResponse(3))
            renderPage()

            expect(await screen.findByRole('link', {name: /Project 1/})).toHaveAttribute('href', '/project/project-1')
            expect(screen.getByRole('link', {name: /Project 2/})).toHaveAttribute('href', '/project/project-2')
            expect(screen.getByRole('link', {name: /Project 3/})).toHaveAttribute('href', '/project/project-3')
            expect(screen.queryByText('No projects found.')).not.toBeInTheDocument()
        })

        it('shows hero projects as large cards and the rest as regular cards', async () => {
            fetchMock.mockResolvedValue(featuredResponse(3, ['id-1']))
            renderPage()

            // hero cards have a VIEW button; regular cards are links
            expect(await screen.findAllByRole('button', {name: 'VIEW'})).toHaveLength(1)
            expect(screen.queryByRole('link', {name: /Project 1/})).not.toBeInTheDocument()
            expect(screen.getByRole('link', {name: /Project 2/})).toBeInTheDocument()
            expect(screen.getByRole('link', {name: /Project 3/})).toBeInTheDocument()
        })

        it('shows no hero cards when none are marked as hero', async () => {
            fetchMock.mockResolvedValue(featuredResponse(2))
            renderPage()

            await screen.findByRole('link', {name: /Project 1/})

            expect(screen.queryByRole('button', {name: 'VIEW'})).not.toBeInTheDocument()
        })
    })

    describe('when loading fails', () => {
        it('shows an error when the server responds with an error', async () => {
            fetchMock.mockResolvedValue({ok: false, json: async () => ({})})
            renderPage()

            expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load projects.')
            expect(screen.queryByText('No projects found.')).not.toBeInTheDocument()
        })

        it('shows an error when the request itself fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderPage()

            expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load projects.')
        })
    })
})