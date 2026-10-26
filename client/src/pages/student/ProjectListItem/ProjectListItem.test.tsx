import type {ProjectVersionSummaryType} from '@hapi/shared/types/project'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ProjectListItem} from './ProjectListItem.tsx'

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const approvedId = '11111111-1111-4111-8111-111111111111'
const alternateId = '22222222-2222-4222-8222-222222222222'

const refresh = vi.fn()
const fetchMock = vi.fn()

function makeSummary(overrides: Partial<ProjectVersionSummaryType> = {}): ProjectVersionSummaryType {
    return {
        name: 'My App',
        projectId: '33333333-3333-4333-8333-333333333333',
        projectSlug: 'my-app',
        users: [],
        feedbackHistory: [],
        ...overrides,
    }
}

function approved(overrides: Partial<NonNullable<ProjectVersionSummaryType['approvedVersion']>> = {}) {
    return {id: approvedId, live: true, ...overrides}
}

function alternate(
    status: NonNullable<ProjectVersionSummaryType['alternateVersion']>['status'],
    overrides: Partial<NonNullable<ProjectVersionSummaryType['alternateVersion']>> = {},
) {
    return {id: alternateId, status, ...overrides}
}

function renderItem(summary: ProjectVersionSummaryType) {
    return render(
        <ul>
            <ProjectListItem summary={summary} refresh={refresh}/>
        </ul>,
    )
}

function actionButtonNames() {
    return ['Edit', 'Revise', 'Withdraw', 'Delete']
        .filter((name) => screen.queryByRole('button', {name: new RegExp(name)}))
}

describe('ProjectListItem (student)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
        dispatchModal.mockResolvedValue('confirm')
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('shows the project name', () => {
        renderItem(makeSummary({approvedVersion: approved()}))

        expect(screen.getByText('My App')).toBeInTheDocument()
    })

    describe('versions', () => {
        it('shows only the approved version when there is no alternate', () => {
            renderItem(makeSummary({approvedVersion: approved()}))

            expect(screen.getByText('Approved version')).toBeInTheDocument()
            expect(screen.getByText('APPROVED')).toBeInTheDocument()
            expect(screen.queryByText('Alternate version')).not.toBeInTheDocument()
        })

        it('calls an alternate an "alternate version" when there is an approved version', () => {
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('PENDING')}))

            expect(screen.getByText('Alternate version')).toBeInTheDocument()
            expect(screen.getByText('PENDING')).toBeInTheDocument()
        })

        it('calls an alternate a "pending version" when nothing is approved yet', () => {
            renderItem(makeSummary({alternateVersion: alternate('NOT_SUBMITTED')}))

            expect(screen.getByText('Pending version')).toBeInTheDocument()
            expect(screen.queryByText('Approved version')).not.toBeInTheDocument()
            expect(screen.getByText('NOT SUBMITTED')).toBeInTheDocument()
        })

        it.each(['REJECTED', 'SUPERSEDED'] as const)('shows a %s status', (status) => {
            renderItem(makeSummary({alternateVersion: alternate(status)}))

            expect(screen.getByText(status)).toBeInTheDocument()
        })

        it('shows how long ago each version was reviewed', () => {
            const reviewedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            renderItem(makeSummary({
                approvedVersion: approved({reviewedAt}),
                alternateVersion: alternate('REJECTED', {reviewedAt}),
            }))

            expect(screen.getAllByText('3 days ago')).toHaveLength(2)
        })

        it('shows no review time for unreviewed versions', () => {
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('PENDING')}))

            expect(screen.queryByText(/ago/)).not.toBeInTheDocument()
        })
    })

    describe('available actions', () => {
        it('offers to revise an approved version with no alternate', () => {
            renderItem(makeSummary({approvedVersion: approved()}))

            expect(actionButtonNames()).toEqual(['Revise'])
        })

        it('offers to withdraw a pending alternate', () => {
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('PENDING')}))

            expect(actionButtonNames()).toEqual(['Withdraw'])
        })

        it('offers to revise a rejected alternate', () => {
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('REJECTED')}))

            expect(actionButtonNames()).toEqual(['Revise'])
        })

        it('offers to edit or delete an unsubmitted alternate of an approved project', () => {
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('NOT_SUBMITTED')}))

            expect(actionButtonNames()).toEqual(['Edit', 'Delete'])
        })

        it('only offers to edit an unsubmitted version of an unapproved project', () => {
            renderItem(makeSummary({alternateVersion: alternate('NOT_SUBMITTED')}))

            expect(actionButtonNames()).toEqual(['Edit'])
        })

        it('offers nothing for other statuses', () => {
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('SUPERSEDED')}))

            expect(actionButtonNames()).toEqual([])
        })
    })

    describe('editing', () => {
        it('goes to the editor for the alternate version', async () => {
            const user = userEvent.setup()
            renderItem(makeSummary({alternateVersion: alternate('NOT_SUBMITTED')}))

            await user.click(screen.getByRole('button', {name: /Edit/}))

            expect(navigate).toHaveBeenCalledWith(`/student/project/${alternateId}`)
        })
    })

    describe('revising', () => {
        it('creates a new version from the approved version and opens it', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue({ok: true, json: async () => ({versionId: 'new-version'})})
            renderItem(makeSummary({approvedVersion: approved()}))

            await user.click(screen.getByRole('button', {name: /Revise/}))

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/project/version/${approvedId}/new`),
                expect.objectContaining({method: 'POST', credentials: 'include'}),
            )
            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/student/project/new-version'))
        })

        it('creates a new version from a rejected alternate', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue({ok: true, json: async () => ({versionId: 'new-version'})})
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('REJECTED')}))

            await user.click(screen.getByRole('button', {name: /Revise/}))

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/project/version/${alternateId}/new`),
                expect.anything(),
            )
        })

        it('shows the server error and stays put when it fails', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue({ok: false, statusText: 'Bad Request', json: async () => ({error: 'Already revising'})})
            renderItem(makeSummary({approvedVersion: approved()}))

            await user.click(screen.getByRole('button', {name: /Revise/}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({
                headline: 'Error',
                body: 'Error: Already revising',
            }))
            expect(navigate).not.toHaveBeenCalled()
        })
    })

    describe('withdrawing', () => {
        async function withdraw() {
            const user = userEvent.setup()
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('PENDING')}))
            await user.click(screen.getByRole('button', {name: /Withdraw/}))
        }

        it('asks for confirmation first', async () => {
            fetchMock.mockResolvedValue({ok: true})
            await withdraw()

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({headline: 'Withdraw revision'}))
        })

        it('does nothing when cancelled', async () => {
            dispatchModal.mockResolvedValue('cancel')
            await withdraw()

            expect(fetchMock).not.toHaveBeenCalled()
            expect(refresh).not.toHaveBeenCalled()
        })

        it('sets the alternate back to not submitted and refreshes', async () => {
            fetchMock.mockResolvedValue({ok: true})
            await withdraw()

            await waitFor(() => expect(refresh).toHaveBeenCalled())
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/project/version/${alternateId}/status`),
                expect.objectContaining({
                    method: 'PATCH',
                    credentials: 'include',
                    body: JSON.stringify({status: 'NOT_SUBMITTED'}),
                }),
            )
        })

        it('shows an error and does not refresh when it fails', async () => {
            fetchMock.mockResolvedValue({ok: false, statusText: 'Conflict', json: async () => { throw new SyntaxError() }})
            await withdraw()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Conflict'}))
            expect(refresh).not.toHaveBeenCalled()
        })
    })

    describe('deleting', () => {
        async function deleteAlternate() {
            const user = userEvent.setup()
            renderItem(makeSummary({approvedVersion: approved(), alternateVersion: alternate('NOT_SUBMITTED')}))
            await user.click(screen.getByRole('button', {name: /Delete/}))
        }

        it('does nothing when cancelled', async () => {
            dispatchModal.mockResolvedValue('cancel')
            await deleteAlternate()

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({headline: 'Delete revision?'}))
            expect(fetchMock).not.toHaveBeenCalled()
            expect(refresh).not.toHaveBeenCalled()
        })

        it('deletes the alternate and refreshes', async () => {
            fetchMock.mockResolvedValue({ok: true})
            await deleteAlternate()

            await waitFor(() => expect(refresh).toHaveBeenCalled())
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/project/version/${alternateId}`),
                expect.objectContaining({method: 'DELETE', credentials: 'include'}),
            )
        })

        it('shows an error when it fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            await deleteAlternate()

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({
                headline: 'Error',
                body: 'TypeError: Network down',
            }))
        })
    })

    describe('feedback history', () => {
        it('shows no feedback section when there is no feedback', () => {
            renderItem(makeSummary({approvedVersion: approved()}))

            expect(screen.queryByText('Feedback history')).not.toBeInTheDocument()
        })

        it('lists each piece of feedback with its reviewer', () => {
            renderItem(makeSummary({
                alternateVersion: alternate('REJECTED'),
                feedbackHistory: [
                    {reviewer: 'Alice', reviewedAt: new Date(), feedback: 'Needs icons'},
                    {reviewer: 'Bob', reviewedAt: new Date(), feedback: 'Fix typos'},
                ],
            }))

            expect(screen.getByText('Feedback history')).toBeInTheDocument()
            expect(screen.getByText('Alice')).toBeInTheDocument()
            expect(screen.getByText('Bob')).toBeInTheDocument()
            expect(screen.getAllByRole('button', {name: 'View feedback'})).toHaveLength(2)
        })

        it('opens the feedback in a modal', async () => {
            const user = userEvent.setup()
            const reviewedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            renderItem(makeSummary({
                alternateVersion: alternate('REJECTED'),
                feedbackHistory: [{reviewer: 'Alice', reviewedAt, feedback: 'Needs icons'}],
            }))

            await user.click(screen.getByRole('button', {name: 'View feedback'}))

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Feedback | Alice | 2 days ago',
            }))
            const {body} = dispatchModal.mock.calls[0][0]
            render(body)
            expect(screen.getByText('Needs icons')).toBeInTheDocument()
        })
    })
})
