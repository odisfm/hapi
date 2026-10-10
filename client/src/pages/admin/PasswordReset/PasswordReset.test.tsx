import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useAuth} from '../../../contexts/auth/useAuth.ts'
import {PasswordReset} from './PasswordReset.tsx'

const {navigate, dispatchModal, setUserDetails} = vi.hoisted(() => ({
    navigate: vi.fn(),
    dispatchModal: vi.fn(),
    setUserDetails: vi.fn(),
}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => ({dispatchModal}),
}))

vi.mock('../../../contexts/auth/useAuth.ts', () => ({
    useAuth: vi.fn(),
}))

const fetchMock = vi.fn()
const signedInUser = {name: 'Max', needsPasswordReset: true}
const strongPassword = 'Str0ngPassw0rd2025'

function renderStage(stage: string) {
    return render(
        <MemoryRouter initialEntries={[`/reset-password/${stage}`]}>
            <Routes>
                <Route path="/reset-password/:stage" element={<PasswordReset/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

function verifyInputs() {
    const [email, code] = screen.getAllByRole('textbox')
    return {email, code}
}

async function fillNewPassword(password: string, confirmation: string) {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('New password'), password)
    await user.tab()
    await user.keyboard(confirmation)
    await user.click(screen.getByRole('button', {name: 'Set new password'}))
}

function okResponse(body: unknown = {}) {
    return {ok: true, statusText: 'OK', json: async () => body}
}

function errorResponse(statusText: string, body: unknown = {}) {
    return {ok: false, statusText, json: async () => body}
}

describe('PasswordReset', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        dispatchModal.mockResolvedValue(undefined)
        vi.stubGlobal('fetch', fetchMock)
        vi.mocked(useAuth).mockReturnValue({
            user: signedInUser,
            setUserDetails,
        } as unknown as ReturnType<typeof useAuth>)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('with an unknown stage', () => {
        it('sends the user to the start of the reset flow', () => {
            renderStage('nonsense')

            expect(navigate).toHaveBeenCalledWith('/reset-password/request')
        })

        it('does not redirect for a known stage', () => {
            renderStage('request')

            expect(navigate).not.toHaveBeenCalled()
        })
    })

    describe('request stage', () => {
        it('asks for an email address', () => {
            renderStage('request')

            expect(screen.getByRole('heading', {name: 'Reset password'})).toBeInTheDocument()
            expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
            expect(screen.getByRole('textbox')).toBeEnabled()
            expect(screen.getByRole('button', {name: 'Request reset'})).toBeInTheDocument()
        })

        it('does not show the code or password fields', () => {
            renderStage('request')

            expect(screen.queryByText('Enter code')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
        })

        it('sends the email and moves on to the verify stage', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue(okResponse())
            renderStage('request')

            await user.type(screen.getByRole('textbox'), 'admin@example.com')
            await user.click(screen.getByRole('button', {name: 'Request reset'}))

            expect(fetchMock).toHaveBeenCalledTimes(1)
            const [url, init] = fetchMock.mock.calls[0]
            expect(url).toContain('/auth/forgot-password')
            expect(init.method).toBe('POST')
            expect(JSON.parse(init.body)).toEqual({email: 'admin@example.com'})
            expect(navigate).toHaveBeenCalledWith('/reset-password/verify')
        })

        it('does not send a request when the email is empty', async () => {
            const user = userEvent.setup()
            renderStage('request')

            await user.click(screen.getByRole('button', {name: 'Request reset'}))

            expect(fetchMock).not.toHaveBeenCalled()
        })

        it('shows an error and stays put when the server rejects the request', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue(errorResponse('Bad Gateway'))
            renderStage('request')

            await user.type(screen.getByRole('textbox'), 'admin@example.com')
            await user.click(screen.getByRole('button', {name: 'Request reset'}))

            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Error', body: expect.stringContaining('Bad Gateway')}),
            )
            expect(navigate).not.toHaveBeenCalled()
        })

        it('shows an error when the request fails', async () => {
            const user = userEvent.setup()
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderStage('request')

            await user.type(screen.getByRole('textbox'), 'admin@example.com')
            await user.click(screen.getByRole('button', {name: 'Request reset'}))

            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Error', body: expect.stringContaining('Network down')}),
            )
            expect(navigate).not.toHaveBeenCalled()
        })
    })

    describe('verify stage', () => {
        it('asks for the emailed code and locks the email field', () => {
            renderStage('verify')

            expect(screen.getByText(/enter the code sent to your email/i)).toBeInTheDocument()
            expect(screen.getByText('Enter code')).toBeInTheDocument()
            expect(verifyInputs().email).toBeDisabled()
            expect(verifyInputs().code).toBeEnabled()
            expect(screen.getByRole('button', {name: 'Verify code'})).toBeInTheDocument()
        })

        it('sends the code, signs the user in and moves on to choosing a password', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue(okResponse({user: signedInUser}))
            renderStage('verify')

            await user.type(verifyInputs().code, '12345678')
            await user.click(screen.getByRole('button', {name: 'Verify code'}))

            expect(fetchMock).toHaveBeenCalledTimes(1)
            const [url, init] = fetchMock.mock.calls[0]
            expect(url).toContain('/auth/forgot-password/verify')
            expect(init.method).toBe('POST')
            expect(init.credentials).toBe('include')
            expect(JSON.parse(init.body).code).toBe('12345678')
            expect(setUserDetails).toHaveBeenCalledWith(signedInUser)
            expect(navigate).toHaveBeenCalledWith('/reset-password/new-password')
        })

        it('does not send a request when the code is empty', async () => {
            const user = userEvent.setup()
            renderStage('verify')

            await user.click(screen.getByRole('button', {name: 'Verify code'}))

            expect(fetchMock).not.toHaveBeenCalled()
        })

        it('shows the server\'s message when the code is wrong', async () => {
            const user = userEvent.setup()
            fetchMock.mockResolvedValue(errorResponse('Unauthorized', {error: 'Invalid code'}))
            renderStage('verify')

            await user.type(verifyInputs().code, '00000000')
            await user.click(screen.getByRole('button', {name: 'Verify code'}))

            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Error', body: expect.stringContaining('Invalid code')}),
            )
            expect(setUserDetails).not.toHaveBeenCalled()
            expect(navigate).not.toHaveBeenCalled()
        })
    })

    describe('choosing a new password', () => {
        it.each(['new-password', 'force-reset'])('shows the password fields and a list of requirements (%s)', (stage) => {
            renderStage(stage)

            expect(screen.getByLabelText('New password')).toHaveAttribute('type', 'password')
            expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
            expect(screen.getByRole('button', {name: 'Set new password'})).toBeInTheDocument()
        })

        it('explains that a reset is required, and offers a way out, only when forced', () => {
            renderStage('force-reset')

            expect(screen.getByText(/you must set a new password/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Log out and return home'})).toBeInTheDocument()
        })

        it('does not show the forced-reset message on the normal stage', () => {
            renderStage('new-password')

            expect(screen.queryByText(/you must set a new password/i)).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Log out and return home'})).not.toBeInTheDocument()
        })

        it('saves the new password, clears the reset flag and goes to the dashboard', async () => {
            fetchMock.mockResolvedValue(okResponse())
            renderStage('new-password')

            await fillNewPassword(strongPassword, strongPassword)

            expect(fetchMock).toHaveBeenCalledTimes(1)
            const [url, init] = fetchMock.mock.calls[0]
            expect(url).toContain('/auth/password')
            expect(init.method).toBe('POST')
            expect(init.credentials).toBe('include')
            expect(JSON.parse(init.body)).toEqual({password: strongPassword})
            expect(setUserDetails).toHaveBeenCalledWith({...signedInUser, needsPasswordReset: false})
            expect(navigate).toHaveBeenCalledWith('/dashboard')
        })

        it('shows an error and stays put when the server rejects the password', async () => {
            fetchMock.mockResolvedValue(errorResponse('Bad Request'))
            renderStage('new-password')

            await fillNewPassword(strongPassword, strongPassword)

            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Error', body: expect.stringContaining('Bad Request')}),
            )
            expect(setUserDetails).not.toHaveBeenCalled()
            expect(navigate).not.toHaveBeenCalledWith('/dashboard')
        })
    })
})