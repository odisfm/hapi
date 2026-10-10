import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useAuth} from '../../contexts/auth/useAuth.ts'
import AdminLoginPage from './AdminLoginPage.tsx'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../contexts/auth/useAuth.ts', () => ({
    useAuth: vi.fn(),
}))

const setUserDetails = vi.fn()
const fetchMock = vi.fn()

function mockAuth(user: {name: string} | null) {
     const context = {user, setUserDetails}
    vi.mocked(useAuth).mockReturnValue(context as unknown as ReturnType<typeof useAuth>)
}

function renderPage() {
    return render(
        <MemoryRouter>
            <AdminLoginPage/>
        </MemoryRouter>,
    )
}

async function logIn(email = 'admin@example.com', password = 'secret123') {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), email)
    await user.type(screen.getByLabelText('Password'), password)
    await user.click(screen.getByRole('button', {name: 'Log in'}))
}

describe('AdminLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        mockAuth(null)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('the form', () => {
        it('shows empty email and password fields and a log in button', () => {
            renderPage()

            expect(screen.getByRole('heading', {name: 'Admin Login'})).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toHaveValue('')
            expect(screen.getByLabelText('Password')).toHaveValue('')
            expect(screen.getByRole('button', {name: 'Log in'})).toBeEnabled()
        })

        it('links to the password reset page', () => {
            renderPage()

            expect(screen.getByRole('link', {name: 'Forgot password?'}))
                .toHaveAttribute('href', '/reset-password/request')
        })

        it('shows no error before anything is submitted', () => {
            renderPage()

            expect(screen.queryByText(/couldn't connect|unauthorized|invalid/i)).not.toBeInTheDocument()
        })

        it('does not send a request when the fields are empty', async () => {
            const user = userEvent.setup()
            renderPage()

            await user.click(screen.getByRole('button', {name: 'Log in'}))

            expect(fetchMock).not.toHaveBeenCalled()
        })
    })

    describe('when already signed in', () => {
        it('sends the user to the dashboard', () => {
            mockAuth({name: 'Max'})
            renderPage()

            expect(navigate).toHaveBeenCalledWith('/protected')
        })
    })

    describe('logging in', () => {
        it('sends the email and password to the server with credentials', async () => {
            const loggedInUser = {name: 'Max'}
            fetchMock.mockResolvedValue({status: 200, statusText: 'OK', json: async () => ({user: loggedInUser})})
            renderPage()

            await logIn('admin@example.com', 'secret123')

            expect(fetchMock).toHaveBeenCalledTimes(1)
            const [url, init] = fetchMock.mock.calls[0]
            expect(url).toContain('/auth/login')
            expect(init.method).toBe('POST')
            expect(init.credentials).toBe('include')
            expect(JSON.parse(init.body)).toEqual({email: 'admin@example.com', password: 'secret123'})
        })

        it('stores the signed-in user when the login succeeds', async () => {
            const loggedInUser = {name: 'Max'}
            fetchMock.mockResolvedValue({status: 200, statusText: 'OK', json: async () => ({user: loggedInUser})})
            renderPage()

            await logIn()

            expect(setUserDetails).toHaveBeenCalledWith(loggedInUser)
            expect(screen.queryByText(/invalid|unauthorized|couldn't connect/i)).not.toBeInTheDocument()
        })

        it('shows the server\'s error message when the login is rejected', async () => {
            fetchMock.mockResolvedValue({
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({error: 'Invalid email or password'}),
            })
            renderPage()

            await logIn()

            expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
            expect(setUserDetails).not.toHaveBeenCalled()
        })

        it('shows the status when the server gives no error message', async () => {
            fetchMock.mockResolvedValue({status: 500, statusText: 'Internal Server Error', json: async () => ({})})
            renderPage()

            await logIn()

            expect(await screen.findByText('500: Internal Server Error')).toBeInTheDocument()
            expect(setUserDetails).not.toHaveBeenCalled()
        })

        it('says it could not connect when the request fails', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => {})
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderPage()

            await logIn()

            expect(await screen.findByText("Couldn't connect to the server. Try again later.")).toBeInTheDocument()
            expect(setUserDetails).not.toHaveBeenCalled()
        })
    })
})