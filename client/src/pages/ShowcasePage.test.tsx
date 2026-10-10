import {render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ShowcasePage} from './ShowcasePage.tsx'

type ShowcaseOverrides = Record<string, unknown>

function makeProject(n: number) {
    return {
        id: `id-${n}`,
        name: `Project ${n}`,
        subtitle: `Subtitle ${n}`,
        iconUrl: 'example-icon',
        slug: `project-${n}`,
    }
}

function makeShowcase(overrides: ShowcaseOverrides = {}) {
    return {
        id: 'showcase-1',
        name: 'Spring Showcase',
        year: 2025,
        semester: 1,
        description: 'Student work from this semester.',
        projects: [makeProject(1), makeProject(2)],
        ...overrides,
    }
}

function showcaseResponse(overrides: ShowcaseOverrides = {}) {
    return {ok: true, json: async () => ({showcase: makeShowcase(overrides)})}
}

function renderPage(slug = 'spring-showcase') {
    return render(
        <MemoryRouter initialEntries={[`/showcase/${slug}`]}>
            <Routes>
                <Route path="/showcase/:showcaseSlug" element={<ShowcasePage/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

async function renderLoaded(overrides: ShowcaseOverrides = {}) {
    fetchMock.mockResolvedValue(showcaseResponse(overrides))
    renderPage()
    await screen.findByRole('heading', {level: 1})
}

const fetchMock = vi.fn()

describe('ShowcasePage', () => {
    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        // the page logs the showcase it loads; keep test output clean
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('requests the showcase for the slug in the URL', async () => {
            await renderLoaded()

            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/showcase/spring-showcase'))
        })

        it('shows no showcase content while loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderPage()

            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })
    })

    describe('when loading fails', () => {
        beforeEach(() => {
            vi.spyOn(console, 'error').mockImplementation(() => {})
        })

        it('shows no showcase when the server responds with an error', async () => {
            fetchMock.mockResolvedValue({ok: false, json: async () => ({})})
            renderPage()

            await waitFor(() => expect(console.error).toHaveBeenCalled())

            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })

        it('shows no showcase when the request itself fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderPage()

            await waitFor(() => expect(console.error).toHaveBeenCalled())

            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })
    })

    describe('showcase details', () => {
        it('shows the name and year as the main heading', async () => {
            await renderLoaded()

            expect(screen.getByRole('heading', {level: 1, name: 'Spring Showcase 2025'})).toBeInTheDocument()
        })

        it('shows the semester when there is a year and a semester', async () => {
            await renderLoaded({year: 2025, semester: 2})

            expect(screen.getByRole('heading', {level: 2, name: 'Semester 2'})).toBeInTheDocument()
        })

        it('shows no semester when there is no semester', async () => {
            await renderLoaded({year: 2025, semester: null})

            expect(screen.queryByRole('heading', {level: 2})).not.toBeInTheDocument()
        })

        it('shows only the name, with no year or semester, when there is no year', async () => {
            await renderLoaded({year: null, semester: 1})

            expect(screen.getByRole('heading', {level: 1, name: 'Spring Showcase'})).toBeInTheDocument()
            expect(screen.queryByRole('heading', {level: 2})).not.toBeInTheDocument()
        })

        it('renders the description as formatted markdown', async () => {
            await renderLoaded({description: 'Work from **every** team.'})

            expect(screen.getByText('every').tagName).toBe('STRONG')
            expect(screen.getByText(/Work from/)).toBeInTheDocument()
        })
    })

    describe('projects', () => {
        it('has a projects heading', async () => {
            await renderLoaded()

            expect(screen.getByRole('heading', {level: 3, name: 'PROJECTS'})).toBeInTheDocument()
        })

        it('shows each project as a link to its page', async () => {
            await renderLoaded()

            expect(screen.getByRole('link', {name: /Project 1/})).toHaveAttribute('href', '/project/project-1')
            expect(screen.getByRole('link', {name: /Project 2/})).toHaveAttribute('href', '/project/project-2')
        })

        it('shows no project links when the showcase has no projects', async () => {
            await renderLoaded({projects: []})

            expect(screen.getByRole('heading', {level: 3, name: 'PROJECTS'})).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })
    })
})