import {render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ShowcaseIndexPage} from './ShowcaseIndexPage.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const fetchMock = vi.fn()

function makeShowcase(name: string, projects: number, overrides: Record<string, unknown> = {}) {
    return {
        id: `${name}-id`,
        name,
        year: 0,
        semester: 0,
        publishedDate: null,
        _count: {projects},
        slugs: [{slug: name.toLowerCase()}],
        ...overrides,
    }
}

function showcasesResponse(showcases: ReturnType<typeof makeShowcase>[]) {
    return {ok: true, json: async () => ({showcases})}
}

function renderPage() {
    return render(
        <MemoryRouter>
            <ShowcaseIndexPage/>
        </MemoryRouter>,
    )
}

describe('ShowcaseIndexPage', () => {
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

    it('shows a spinner while loading', () => {
        fetchMock.mockReturnValue(new Promise(() => {}))
        const {container} = renderPage()

        expect(screen.getByRole('heading', {level: 1, name: 'Showcases'})).toBeInTheDocument()
        expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('requests all showcases without credentials', async () => {
        fetchMock.mockResolvedValue(showcasesResponse([]))
        renderPage()

        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/showcase/all'),
            expect.objectContaining({method: 'GET', credentials: 'omit'}),
        ))
    })

    describe('when showcases load', () => {
        it('lists showcases that have projects and hides the spinner', async () => {
            fetchMock.mockResolvedValue(showcasesResponse([
                makeShowcase('Expo', 3),
                makeShowcase('Hackathon', 1),
            ]))
            const {container} = renderPage()

            expect(await screen.findByText('Expo')).toBeInTheDocument()
            expect(screen.getByText('Hackathon')).toBeInTheDocument()
            expect(screen.getAllByRole('link', {name: 'View'})).toHaveLength(2)
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
        })

        it('leaves out showcases with no projects', async () => {
            fetchMock.mockResolvedValue(showcasesResponse([
                makeShowcase('Expo', 3),
                makeShowcase('Empty', 0),
            ]))
            renderPage()

            await screen.findByText('Expo')

            expect(screen.queryByText('Empty')).not.toBeInTheDocument()
        })

        it('groups showcases of the same name by year', async () => {
            fetchMock.mockResolvedValue(showcasesResponse([
                makeShowcase('Expo', 1, {id: 'a', year: 2024, slugs: [{slug: 'expo-2024'}]}),
                makeShowcase('Expo', 1, {id: 'b', year: 2025, slugs: [{slug: 'expo-2025'}]}),
            ]))
            renderPage()

            expect(await screen.findByRole('link', {name: '2025'})).toHaveAttribute('href', '/showcase/expo-2025')
            expect(screen.getByRole('link', {name: '2024'})).toHaveAttribute('href', '/showcase/expo-2024')
            expect(screen.getAllByText('Expo')).toHaveLength(1)
        })
    })

    describe('when loading fails', () => {
        it('shows the server error', async () => {
            fetchMock.mockResolvedValue({ok: false, statusText: 'Internal Server Error', json: async () => ({error: 'Database down'})})
            const {container} = renderPage()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Database down'}))
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
        })

        it('shows an error when the request itself fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderPage()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'TypeError: Network down'}))
        })
    })
})
