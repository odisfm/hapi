import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {StudentNewProject} from './StudentNewProject.tsx'

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const fetchMock = vi.fn()

function makeShowcase(id: string, name: string, year: number | null, semester: number | null) {
    return {id, name, year, semester, publishedDate: null, _count: {projects: 0}, slugs: []}
}

function showcasesResponse() {
    return {
        ok: true,
        json: async () => ({
            showcases: [
                makeShowcase('show-1', 'Expo', 2025, 1),
                makeShowcase('show-2', 'Hackathon', null, null),
            ],
        }),
    }
}

async function renderLoaded() {
    fetchMock.mockResolvedValueOnce(showcasesResponse())
    render(<StudentNewProject/>)
    await screen.findByRole('option', {name: 'Expo 2025 sem1'})
}

describe('StudentNewProject', () => {
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

    describe('showcase choice', () => {
        it('offers every showcase by its full name', async () => {
            await renderLoaded()

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/showcase/all'),
                expect.objectContaining({credentials: 'include'}),
            )
            const options = screen.getAllByRole('option').map((o) => o.textContent)
            expect(options).toEqual(['Expo 2025 sem1', 'Hackathon'])
            expect(screen.getByRole('combobox', {name: 'Showcase'})).toBeRequired()
        })

        it('shows an error and returns to the dashboard when showcases fail to load', async () => {
            fetchMock.mockResolvedValueOnce({ok: false, statusText: 'Forbidden', json: async () => ({error: 'Not a student'})})
            render(<StudentNewProject/>)

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/student'))
            expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Not a student'})
        })
    })

    describe('creating', () => {
        it('creates the project in the chosen showcase and opens it', async () => {
            const user = userEvent.setup()
            await renderLoaded()
            fetchMock.mockResolvedValueOnce({ok: true, json: async () => ({versionId: 'new-version'})})

            await user.selectOptions(screen.getByRole('combobox', {name: 'Showcase'}), 'Hackathon')
            await user.click(screen.getByRole('button', {name: 'Create project'}))

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/student/project/new-version'))
            expect(fetchMock).toHaveBeenLastCalledWith(
                expect.stringContaining('/project'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify({showcaseId: 'show-2'}),
                }),
            )
        })

        it('shows the server error and returns to the dashboard when creation is rejected', async () => {
            const user = userEvent.setup()
            await renderLoaded()
            fetchMock.mockResolvedValueOnce({ok: false, statusText: 'Conflict', json: async () => ({error: 'Showcase closed'})})

            await user.click(screen.getByRole('button', {name: 'Create project'}))

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/student'))
            expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Showcase closed'})
        })

        it('shows an error when the request itself fails', async () => {
            const user = userEvent.setup()
            await renderLoaded()
            fetchMock.mockRejectedValueOnce(new TypeError('Network down'))

            await user.click(screen.getByRole('button', {name: 'Create project'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'TypeError: Network down'}))
        })
    })
})
