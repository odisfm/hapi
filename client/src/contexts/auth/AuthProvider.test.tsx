import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {AuthProvider} from './AuthProvider.tsx'
import {useAuth} from './useAuth.ts'

const fetchMock = vi.fn()

const signedInUser = {id: 'user-1', name: 'Max', email: 'max@example.com', role: 'ADMIN'}

function Consumer() {
    const {user, authPending, logOut} = useAuth()
    if (authPending) return <p>Checking session</p>
    return (
        <>
            <p>{user ? `Signed in as ${user.name}` : 'Signed out'}</p>
            <button type="button" onClick={logOut}>Log out</button>
        </>
    )
}

function renderProvider() {
    return render(
        <AuthProvider>
            <Consumer/>
        </AuthProvider>,
    )
}

describe('AuthProvider', () => {
    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('throws when useAuth is used outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => render(<Consumer/>)).toThrow('useAuth must be used within an AuthProvider')
    })

    describe('checking the session', () => {
        it('is pending until the server responds', async () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderProvider()

            expect(screen.getByText('Checking session')).toBeInTheDocument()
        })

        it('asks the server who is signed in, with credentials', async () => {
            fetchMock.mockResolvedValue({ok: false})
            renderProvider()

            await screen.findByText('Signed out')

            expect(fetchMock).toHaveBeenCalledTimes(1)
            const [url, init] = fetchMock.mock.calls[0]
            expect(url).toContain('/auth/me')
            expect(init).toEqual({method: 'GET', credentials: 'include'})
        })

        it('provides the signed-in user', async () => {
            fetchMock.mockResolvedValue({ok: true, json: async () => ({user: signedInUser})})
            renderProvider()

            expect(await screen.findByText('Signed in as Max')).toBeInTheDocument()
        })

        it('leaves the user signed out when the server rejects the session', async () => {
            fetchMock.mockResolvedValue({ok: false, json: async () => ({error: 'Unauthorized'})})
            renderProvider()

            expect(await screen.findByText('Signed out')).toBeInTheDocument()
        })

        it('leaves the user signed out and logs when the request fails', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error = new TypeError('Network down')
            fetchMock.mockRejectedValue(error)
            renderProvider()

            expect(await screen.findByText('Signed out')).toBeInTheDocument()
            expect(consoleError).toHaveBeenCalledWith(error)
        })
    })

    describe('logging out', () => {
        it('tells the server and clears the user', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValueOnce({ok: true, json: async () => ({user: signedInUser})})
            fetchMock.mockResolvedValueOnce({ok: true})
            renderProvider()
            await screen.findByText('Signed in as Max')

            await user.click(screen.getByRole('button', {name: 'Log out'}))

            expect(await screen.findByText('Signed out')).toBeInTheDocument()
            const [url, init] = fetchMock.mock.calls[1]
            expect(url).toContain('/auth/logout')
            expect(init).toEqual({method: 'POST', credentials: 'include'})
        })

        it('still clears the user and logs when the request fails', async () => {
            const user = userEvent.setup()
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error = new TypeError('Network down')
            fetchMock.mockResolvedValueOnce({ok: true, json: async () => ({user: signedInUser})})
            fetchMock.mockRejectedValueOnce(error)
            renderProvider()
            await screen.findByText('Signed in as Max')

            await user.click(screen.getByRole('button', {name: 'Log out'}))

            await waitFor(() => expect(screen.getByText('Signed out')).toBeInTheDocument())
            expect(consoleError).toHaveBeenCalledWith(error)
        })
    })
})
