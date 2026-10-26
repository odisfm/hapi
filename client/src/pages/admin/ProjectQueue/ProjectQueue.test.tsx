import {render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectVersionSummaryType} from '@hapi/shared/types/project'
import {ProjectQueue} from './ProjectQueue.tsx'

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

// One stable object, so the queue's load effect doesn't re-run on every render
vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

function makeSummary(n: number): ProjectVersionSummaryType {
    return {
        name: `Project ${n}`,
        projectId: `${n}23e4567-e89b-42d3-a456-426614174000`,
        projectSlug: `project-${n}`,
        alternateVersion: {id: `${n}33e4567-e89b-42d3-a456-426614174000`, status: 'PENDING'},
        users: [{id: `${n}43e4567-e89b-42d3-a456-426614174000`, name: `Student ${n}`}],
        feedbackHistory: [],
    }
}

const fetchMock = vi.fn()

function jsonOk(body: unknown) {
    return {ok: true, statusText: 'OK', json: async () => body}
}

const emptyMessage = 'No projects awaiting review'

describe('ProjectQueue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('requests the queue and lists each project awaiting review', async () => {
        fetchMock.mockResolvedValueOnce(jsonOk({versions: [makeSummary(1), makeSummary(2)]}))

        render(<ProjectQueue/>)

        expect(await screen.findByText('Project 1')).toBeInTheDocument()
        expect(screen.getByText('Project 2')).toBeInTheDocument()
        expect(screen.getAllByRole('button', {name: 'Review'})).toHaveLength(2)
        expect(screen.queryByText(emptyMessage)).not.toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/project/versions'),
            expect.objectContaining({credentials: 'include'}),
        )
    })

    it('says nothing is waiting once an empty queue has loaded', async () => {
        fetchMock.mockResolvedValueOnce(jsonOk({versions: []}))

        render(<ProjectQueue/>)

        expect(await screen.findByText(emptyMessage)).toBeInTheDocument()
    })

    it('does not claim the queue is empty while it is still loading', async () => {
        fetchMock.mockReturnValueOnce(new Promise(() => {}))

        render(<ProjectQueue/>)

        await waitFor(() => expect(fetchMock).toHaveBeenCalled())
        expect(screen.getByRole('heading', {name: 'Project queue'})).toBeInTheDocument()
        expect(screen.queryByText(emptyMessage)).not.toBeInTheDocument()
    })

    describe('load errors', () => {
        it('shows the status text when the server rejects the request', async () => {
            fetchMock.mockResolvedValueOnce({ok: false, statusText: 'Forbidden', json: async () => ({})})

            render(<ProjectQueue/>)

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({
                headline: 'Failed to get queue',
                body: 'Error: Forbidden',
            }))
            expect(screen.getByText(emptyMessage)).toBeInTheDocument()
        })

        it('shows the error when the request fails', async () => {
            fetchMock.mockRejectedValueOnce(new TypeError('Network down'))

            render(<ProjectQueue/>)

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({
                headline: 'Failed to get queue',
                body: 'TypeError: Network down',
            }))
        })
    })
})
