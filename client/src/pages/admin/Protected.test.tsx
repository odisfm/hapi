import {render} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useAuth} from '../../contexts/auth/useAuth.ts'
import {Protected} from './Protected.tsx'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../contexts/auth/useAuth.ts', () => ({
    useAuth: vi.fn(),
}))

function mockAuth(user: {role: string} | null, authPending = false) {
    const context = {user, authPending}
    vi.mocked(useAuth).mockReturnValue(context as unknown as ReturnType<typeof useAuth>)
}

function renderPage() {
    return render(
        <MemoryRouter>
            <Protected/>
        </MemoryRouter>,
    )
}

describe('Protected', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('waits while the session is still being checked', () => {
        mockAuth(null, true)
        renderPage()

        expect(navigate).not.toHaveBeenCalled()
    })

    it('sends an admin to the dashboard', () => {
        mockAuth({role: 'ADMIN'})
        renderPage()

        expect(navigate).toHaveBeenCalledWith('/dashboard')
    })

    it('sends a student to the student page', () => {
        mockAuth({role: 'STUDENT'})
        renderPage()

        expect(navigate).toHaveBeenCalledWith('/student')
    })

    it('stays put for any other role', () => {
        mockAuth({role: 'GUEST'})
        renderPage()

        expect(navigate).not.toHaveBeenCalled()
    })

    it('renders nothing', () => {
        mockAuth(null, true)
        const {container} = renderPage()

        expect(container).toBeEmptyDOMElement()
    })
})
