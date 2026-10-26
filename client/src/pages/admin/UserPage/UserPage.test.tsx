import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {UserDetails} from '@hapi/shared/types/apiResponses'
import {AuthContext} from '../../../contexts/auth/AuthContext.tsx'
import {UserPage} from './UserPage.tsx'

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

// One stable object, so the load effect doesn't re-run on every render
vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const admin: UserDetails = {name: 'Ada Admin', email: 'ada@example.com', needsPasswordReset: false, role: 'ADMIN'}
const student: UserDetails = {name: 'Sam Student', email: 'sam@example.com', needsPasswordReset: false, role: 'STUDENT'}
const me: UserDetails = {name: 'Me Myself', email: 'me@example.com', needsPasswordReset: false, role: 'ADMIN'}

const fetchMock = vi.fn()

type MockApiOptions = {
    users?: UserDetails[]
    loadFails?: boolean
    deleteFails?: boolean
}

function mockApi({users = [me, admin, student], loadFails = false, deleteFails = false}: MockApiOptions = {}) {
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
        if (init?.method === 'DELETE') {
            return {ok: !deleteFails, statusText: 'Forbidden', json: async () => ({})}
        }
        return loadFails
            ? {ok: false, statusText: 'Unauthorized', json: async () => ({})}
            : {ok: true, statusText: 'OK', json: async () => ({users})}
    })
}

function requestsWithMethod(method: string) {
    return fetchMock.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === method)
}

function section(heading: string) {
    return screen.getByRole('heading', {name: heading}).nextElementSibling as HTMLElement
}

function renderWithAuth() {
    return render(
        <AuthContext.Provider value={{
            user: me,
            setUserDetails: () => {},
            logOut: () => {},
            authPending: false,
        }}>
            <UserPage/>
        </AuthContext.Provider>,
    )
}

async function renderPage(options: MockApiOptions = {}) {
    mockApi(options)
    renderWithAuth()
    await screen.findByRole('heading', {name: 'Admins'})
    return userEvent.setup()
}

describe('UserPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        dispatchModal.mockResolvedValue('ok')
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('hides the lists while the users load', async () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderWithAuth()

            await waitFor(() => expect(screen.queryByRole('heading', {name: 'Admins'})).not.toBeInTheDocument())
            expect(screen.getByRole('heading', {name: 'Users'})).toBeInTheDocument()
            expect(screen.queryByRole('heading', {name: 'Admins'})).not.toBeInTheDocument()
        })

        it('splits the users into admins and students', async () => {
            await renderPage()

            expect(within(section('Admins')).getAllByRole('listitem')).toHaveLength(2)
            expect(within(section('Admins')).getByText('Ada Admin')).toBeInTheDocument()
            expect(within(section('Students')).getAllByRole('listitem')).toHaveLength(1)
            expect(within(section('Students')).getByText('Sam Student')).toBeInTheDocument()
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringMatching(/\/auth\/users$/),
                expect.objectContaining({credentials: 'include'}),
            )
        })

        it('shows an error and empty lists when the users cannot be loaded', async () => {
            await renderPage({loadFails: true})

            expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Unauthorized'})
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
        })
    })

    it('goes to the create user page', async () => {
        const user = await renderPage()

        await user.click(screen.getByRole('button', {name: 'Create user'}))

        expect(navigate).toHaveBeenCalledWith('/dashboard/users/create')
    })

    describe('deleting', () => {
        async function clickDelete(user: ReturnType<typeof userEvent.setup>, name: string) {
            await user.click(within(screen.getByText(name).closest('li')!).getByRole('button'))
        }

        it('asks for confirmation naming the email', async () => {
            dispatchModal.mockResolvedValue('cancel')
            const user = await renderPage()

            await clickDelete(user, 'Sam Student')

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Delete user?',
                body: 'User with email sam@example.com will be deleted immediately.',
            }))
        })

        it('does nothing when the user cancels', async () => {
            dispatchModal.mockResolvedValue('cancel')
            const user = await renderPage()

            await clickDelete(user, 'Sam Student')

            expect(requestsWithMethod('DELETE')).toHaveLength(0)
        })

        it('deletes the user and reloads the list when confirmed', async () => {
            dispatchModal.mockResolvedValue('confirm')
            const user = await renderPage()
            mockApi({users: [me, admin]})

            await clickDelete(user, 'Sam Student')

            await waitFor(() => expect(screen.queryByText('Sam Student')).not.toBeInTheDocument())
            const [url, init] = requestsWithMethod('DELETE')[0]
            expect(url).toMatch(/\/auth\/user$/)
            expect(JSON.parse(init.body)).toEqual({email: 'sam@example.com'})
        })

        it('shows an error and keeps the user when the delete fails', async () => {
            dispatchModal.mockResolvedValueOnce('confirm').mockResolvedValue('ok')
            const user = await renderPage({deleteFails: true})

            await clickDelete(user, 'Sam Student')

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Forbidden'}))
            expect(screen.getByText('Sam Student')).toBeInTheDocument()
            expect(requestsWithMethod('GET')).toHaveLength(1)
        })
    })
})
