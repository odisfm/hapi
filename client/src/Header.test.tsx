import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header.tsx'
import { useAuth } from './contexts/auth/useAuth.ts'

vi.mock('./contexts/auth/useAuth.ts', () => ({
    useAuth: vi.fn(),
}))

vi.mock('./components/SearchOverlay.tsx', () => ({
    default: ({ onClose }: { onClose: () => void }) => (
        <div role="dialog" aria-label="Search overlay">
            <button type="button" onClick={onClose}>
                Close search
            </button>
        </div>
    ),
}))

function mockAuth(user: { name: string } | null) {
    vi.mocked(useAuth).mockReturnValue({ user } as unknown as ReturnType<typeof useAuth>)
}

function renderHeader(initialPath = '/') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Header />
        </MemoryRouter>,
    )
}

describe('Header', () => {
    beforeEach(() => {
        mockAuth(null)
    })

    it('links the logo back to the home page', () => {
        renderHeader()

        expect(screen.getByRole('link', { name: /hapi/i })).toHaveAttribute('href', '/')
    })

    it('shows the applications and categories navigation links', () => {
        renderHeader()

        expect(screen.getByRole('link', { name: 'APPLICATIONS' })).toHaveAttribute('href', '/search')
        expect(screen.getByRole('link', { name: 'CATEGORIES' })).toHaveAttribute('href', '/#categories')
    })

    describe('when signed out', () => {
        it('does not show a greeting or dashboard link', () => {
            renderHeader()

            expect(screen.queryByText(/hello/i)).not.toBeInTheDocument()
            expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
        })
    })

    describe('when signed in', () => {
        beforeEach(() => {
            mockAuth({ name: 'Max' })
        })

        it("greets the user by name", () => {
            renderHeader()

            expect(screen.getByText('Max')).toBeInTheDocument()
        })

        it('links to the dashboard', () => {
            renderHeader()

            expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
        })
    })

    describe('search', () => {
        it('is closed by default', () => {
            renderHeader()

            expect(screen.queryByRole('dialog', { name: /search overlay/i })).not.toBeInTheDocument()
        })

        it('opens the search overlay when the search button is clicked', async () => {
            const user = userEvent.setup()
            renderHeader()

            await user.click(screen.getByRole('button', { name: 'Search' }))

            expect(screen.getByRole('dialog', { name: /search overlay/i })).toBeInTheDocument()
        })

        it('closes the search overlay when it asks to close', async () => {
            const user = userEvent.setup()
            renderHeader()

            await user.click(screen.getByRole('button', { name: 'Search' }))
            await user.click(screen.getByRole('button', { name: /close search/i }))

            expect(screen.queryByRole('dialog', { name: /search overlay/i })).not.toBeInTheDocument()
        })
    })
})