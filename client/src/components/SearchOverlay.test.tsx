import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchOverlay from './SearchOverlay.tsx'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

function renderOverlay() {
    const onClose = vi.fn()
    render(
        <MemoryRouter>
            <SearchOverlay onClose={onClose} />
        </MemoryRouter>,
    )
    return { onClose }
}

describe('SearchOverlay', () => {
    beforeEach(() => {
        navigate.mockClear()
    })

    it('shows an empty search box and the quick links', () => {
        renderOverlay()

        expect(screen.getByRole('searchbox')).toHaveValue('')
        for (const term of ['Health', 'Education', 'Workplace', 'Games']) {
            expect(screen.getByRole('button', { name: term })).toBeInTheDocument()
        }
    })

    describe('submitting a search', () => {
        it('goes to the search page with the typed query when the search button is clicked', async () => {
            const user = userEvent.setup()
            const { onClose } = renderOverlay()

            await user.type(screen.getByRole('searchbox'), 'cats')
            await user.click(screen.getByRole('button', { name: /submit search/i }))

            expect(navigate).toHaveBeenCalledWith('/search?q=cats')
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('submits when the user presses Enter', async () => {
            const user = userEvent.setup()
            const { onClose } = renderOverlay()

            await user.type(screen.getByRole('searchbox'), 'robots{Enter}')

            expect(navigate).toHaveBeenCalledWith('/search?q=robots')
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('encodes special characters in the query', async () => {
            const user = userEvent.setup()
            renderOverlay()

            await user.type(screen.getByRole('searchbox'), 'cats & dogs')
            await user.click(screen.getByRole('button', { name: /submit search/i }))

            expect(navigate).toHaveBeenCalledWith('/search?q=cats%20%26%20dogs')
        })
    })

    describe('quick links', () => {
        it('searches for the clicked term and closes the overlay', async () => {
            const user = userEvent.setup()
            const { onClose } = renderOverlay()

            await user.click(screen.getByRole('button', { name: 'Education' }))

            expect(navigate).toHaveBeenCalledWith('/search?q=Education')
            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('closing', () => {
        it('closes when the backdrop is clicked', async () => {
            const user = userEvent.setup()
            const { onClose } = renderOverlay()

            await user.click(screen.getByRole('button', { name: /close search/i }))

            expect(onClose).toHaveBeenCalledTimes(1)
            expect(navigate).not.toHaveBeenCalled()
        })

        it('closes when Escape is pressed', async () => {
            const user = userEvent.setup()
            const { onClose } = renderOverlay()

            await user.keyboard('{Escape}')

            expect(onClose).toHaveBeenCalledTimes(1)
            expect(navigate).not.toHaveBeenCalled()
        })

        it('ignores other keys', async () => {
            const user = userEvent.setup()
            const { onClose } = renderOverlay()

            await user.keyboard('a')

            expect(onClose).not.toHaveBeenCalled()
        })
    })
})