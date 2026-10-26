import type {ProjectVersionSummaryType} from '@hapi/shared/types/project'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {StudentDashboard} from './StudentDashboard.tsx'

const {navigate, dispatchModal, modalContext, authContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {
        navigate: vi.fn(),
        dispatchModal,
        modalContext: {dispatchModal},
        authContext: {
            user: null as {name: string, role: string} | null,
            authPending: false,
            logOut: vi.fn(),
        },
    }
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

vi.mock('../../contexts/auth/useAuth.ts', () => ({
    useAuth: () => authContext,
}))

const fetchMock = vi.fn()

function makeSummary(name: string, overrides: Partial<ProjectVersionSummaryType> = {}): ProjectVersionSummaryType {
    return {
        name,
        projectId: `${name}-id`,
        projectSlug: name.toLowerCase(),
        users: [],
        feedbackHistory: [],
        ...overrides,
    }
}

function versionsResponse(versions: ProjectVersionSummaryType[]) {
    return {ok: true, json: async () => ({versions})}
}

function signIn(role = 'STUDENT') {
    authContext.user = {name: 'Jane Doe', role}
    authContext.authPending = false
}

describe('StudentDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
        dispatchModal.mockResolvedValue('ok')
        fetchMock.mockResolvedValue(versionsResponse([]))
        signIn()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('access', () => {
        it('lets a signed-in student stay', async () => {
            render(<StudentDashboard/>)

            await waitFor(() => expect(fetchMock).toHaveBeenCalled())

            expect(navigate).not.toHaveBeenCalled()
        })

        it('waits while auth is pending', async () => {
            authContext.user = null
            authContext.authPending = true
            render(<StudentDashboard/>)

            await waitFor(() => expect(fetchMock).toHaveBeenCalled())

            expect(navigate).not.toHaveBeenCalled()
        })

        it('sends a signed-out visitor to log in', () => {
            authContext.user = null
            render(<StudentDashboard/>)

            expect(navigate).toHaveBeenCalledWith('/admin-login')
        })

        it('sends users who are not students away', () => {
            signIn('ADMIN')
            render(<StudentDashboard/>)

            expect(navigate).toHaveBeenCalledExactlyOnceWith('/protected')
        })
    })

    describe('account', () => {
        it('shows who is logged in and lets them log out', async () => {
            const user = userEvent.setup()
            render(<StudentDashboard/>)

            expect(screen.getByText('Logged in as Jane Doe.')).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'Log out.'}))

            expect(authContext.logOut).toHaveBeenCalled()
        })

        it('hides the account details when nobody is logged in', () => {
            authContext.user = null
            authContext.authPending = true
            render(<StudentDashboard/>)

            expect(screen.queryByRole('button', {name: 'Log out.'})).not.toBeInTheDocument()
        })
    })

    it('goes to the new project page', async () => {
        const user = userEvent.setup()
        render(<StudentDashboard/>)

        await user.click(screen.getByRole('button', {name: 'New Project'}))

        expect(navigate).toHaveBeenCalledWith('/student/new-project')
    })

    describe('projects', () => {
        it('requests the student\'s project versions with credentials', async () => {
            render(<StudentDashboard/>)

            await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/project/versions'),
                expect.objectContaining({credentials: 'include'}),
            ))
        })

        it('lists each project', async () => {
            fetchMock.mockResolvedValue(versionsResponse([
                makeSummary('First App', {approvedVersion: {id: 'a', live: true}}),
                makeSummary('Second App', {alternateVersion: {id: 'b', status: 'PENDING'}}),
            ]))
            render(<StudentDashboard/>)

            expect(await screen.findByText('First App')).toBeInTheDocument()
            expect(screen.getByText('Second App')).toBeInTheDocument()
        })

        it('hides superseded alternate versions', async () => {
            fetchMock.mockResolvedValue(versionsResponse([
                makeSummary('My App', {
                    approvedVersion: {id: 'a', live: true},
                    alternateVersion: {id: 'b', status: 'SUPERSEDED'},
                }),
            ]))
            render(<StudentDashboard/>)

            await screen.findByText('My App')

            expect(screen.queryByText('SUPERSEDED')).not.toBeInTheDocument()
            expect(screen.queryByText('Alternate version')).not.toBeInTheDocument()
        })

        it('keeps other alternate versions', async () => {
            fetchMock.mockResolvedValue(versionsResponse([
                makeSummary('My App', {
                    approvedVersion: {id: 'a', live: true},
                    alternateVersion: {id: 'b', status: 'PENDING'},
                }),
            ]))
            render(<StudentDashboard/>)

            expect(await screen.findByText('PENDING')).toBeInTheDocument()
        })

        it('shows the server error when loading fails', async () => {
            fetchMock.mockResolvedValue({ok: false, statusText: 'Unauthorized', json: async () => ({error: 'Not logged in'})})
            render(<StudentDashboard/>)

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Not logged in'}))
        })

        it('shows an error when the request itself fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            render(<StudentDashboard/>)

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'TypeError: Network down'}))
        })
    })
})
