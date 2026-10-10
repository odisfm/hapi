import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAuth} from '../../contexts/auth/useAuth.ts'
import {AdminDashboard} from './AdminDashboard.tsx'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../contexts/auth/useAuth.ts', () => ({
    useAuth: vi.fn(),
}))

const logOut = vi.fn()

type AuthState = {
    user: {name: string} | null
    authPending: boolean
}

function mockAuth({user, authPending}: AuthState) {
    vi.mocked(useAuth).mockReturnValue({user, authPending, logOut} as unknown as ReturnType<typeof useAuth>)
}

function renderDashboard(path = '/dashboard/projects') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/dashboard" element={<AdminDashboard/>}>
                    <Route path="projects" element={<p>Projects view</p>}/>
                    <Route path="categories" element={<p>Categories view</p>}/>
                </Route>
            </Routes>
        </MemoryRouter>,
    )
}

describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAuth({user: {name: 'Max'}, authPending: false})
    })

    it('shows the dashboard heading', () => {
        renderDashboard()

        expect(screen.getByRole('heading', {name: 'Admin Dashboard'})).toBeInTheDocument()
    })

    describe('navigation', () => {
        it('links to each admin section', () => {
            renderDashboard()

            expect(screen.getByRole('link', {name: 'Projects'})).toHaveAttribute('href', '/dashboard/projects')
            expect(screen.getByRole('link', {name: 'Featured Projects'}))
                .toHaveAttribute('href', '/dashboard/featured-projects')
            expect(screen.getByRole('link', {name: 'Showcases'})).toHaveAttribute('href', '/dashboard/showcases')
            expect(screen.getByRole('link', {name: 'Categories'})).toHaveAttribute('href', '/dashboard/categories')
            expect(screen.getByRole('link', {name: 'Users'})).toHaveAttribute('href', '/dashboard/users')
            expect(screen.getByRole('link', {name: 'Analytics'})).toHaveAttribute('href', '/dashboard/analytics')
        })

        it('shows the content of the current section', () => {
            renderDashboard('/dashboard/projects')

            expect(screen.getByText('Projects view')).toBeInTheDocument()
            expect(screen.queryByText('Categories view')).not.toBeInTheDocument()
        })

        it('switches to another section when its link is clicked', async () => {
            const user = userEvent.setup()
            renderDashboard('/dashboard/projects')

            await user.click(screen.getByRole('link', {name: 'Categories'}))

            expect(screen.getByText('Categories view')).toBeInTheDocument()
            expect(screen.queryByText('Projects view')).not.toBeInTheDocument()
        })
    })

    describe('when signed in', () => {
        it('shows who is logged in', () => {
            renderDashboard()

            expect(screen.getByText('Logged in as Max.')).toBeInTheDocument()
        })

        it('logs out when the log out button is clicked', async () => {
            const user = userEvent.setup()
            renderDashboard()

            await user.click(screen.getByRole('button', {name: 'Log out.'}))

            expect(logOut).toHaveBeenCalledTimes(1)
        })

    })

    describe('when signed out', () => {
        it('sends the user to the login page', () => {
            mockAuth({user: null, authPending: false})
            renderDashboard()

            expect(navigate).toHaveBeenCalledWith('/admin-login')
        })

        it('shows no user name or log out button', () => {
            mockAuth({user: null, authPending: false})
            renderDashboard()

            expect(screen.queryByText(/logged in as/i)).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Log out.'})).not.toBeInTheDocument()
        })
    })

    describe('while checking whether the user is signed in', () => {
        it('waits instead of redirecting to the login page', () => {
            mockAuth({user: null, authPending: true})
            renderDashboard()

            expect(navigate).not.toHaveBeenCalled()
        })
    })
})