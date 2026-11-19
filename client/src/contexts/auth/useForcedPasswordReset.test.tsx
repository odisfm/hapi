import {renderHook} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAuth} from './useAuth.ts'
import {FORCED_RESET_PATH, useForcedPasswordReset} from './useForcedPasswordReset.ts'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('./useAuth.ts', () => ({useAuth: vi.fn()}))

function renderAt(path: string, user: {needsPasswordReset: boolean} | null) {
    vi.mocked(useAuth).mockReturnValue({user} as unknown as ReturnType<typeof useAuth>)
    renderHook(() => useForcedPasswordReset(), {
        wrapper: ({children}) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
    })
}

describe('useForcedPasswordReset', () => {
    beforeEach(() => {
        navigate.mockReset()
    })

    it.each(['/', '/dashboard/projects', '/student', '/protected'])(
        'sends a flagged user from %s to the forced reset page',
        (path) => {
            renderAt(path, {needsPasswordReset: true})

            expect(navigate).toHaveBeenCalledWith(FORCED_RESET_PATH, {replace: true})
        },
    )

    it.each(['/reset-password/force-reset', '/reset-password/new-password'])(
        'leaves a flagged user on %s',
        (path) => {
            renderAt(path, {needsPasswordReset: true})

            expect(navigate).not.toHaveBeenCalled()
        },
    )

    it('leaves users without the flag alone', () => {
        renderAt('/dashboard/projects', {needsPasswordReset: false})

        expect(navigate).not.toHaveBeenCalled()
    })

    it('leaves anonymous visitors alone', () => {
        renderAt('/', null)

        expect(navigate).not.toHaveBeenCalled()
    })
})
