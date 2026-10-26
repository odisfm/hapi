import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, useNavigate as useRealNavigate} from 'react-router'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {headerLinks} from '../consts.ts'
import {Sidebar} from './Sidebar.tsx'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

const setSidebarVisible = vi.fn()

function renderSidebar(sidebarVisible = true) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Sidebar sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible}/>
        </MemoryRouter>,
    )
}

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows all header links', () => {
        renderSidebar()

        for (const headerLink of headerLinks) {
            expect(screen.getByRole('link', {name: headerLink.label})).toHaveAttribute('href', headerLink.path)
        }
    })

    describe('visibility', () => {
        it('is interactive when visible', () => {
            renderSidebar(true)

            expect(screen.getByRole('navigation').parentElement).not.toHaveAttribute('inert')
        })

        it('is inert and hidden when not visible', () => {
            renderSidebar(false)

            expect(screen.getByRole('navigation').parentElement).toHaveAttribute('inert')
        })

        it('closes when Escape is pressed', async () => {
            const user = userEvent.setup()
            renderSidebar()
            setSidebarVisible.mockClear()

            await user.keyboard('{Escape}')

            expect(setSidebarVisible).toHaveBeenCalledWith(false)
        })

        it('ignores other keys', async () => {
            const user = userEvent.setup()
            renderSidebar()
            setSidebarVisible.mockClear()

            await user.keyboard('{Enter}')

            expect(setSidebarVisible).not.toHaveBeenCalled()
        })

        it('stops listening for keys once unmounted', async () => {
            const user = userEvent.setup()
            const {unmount} = renderSidebar()
            unmount()
            setSidebarVisible.mockClear()

            await user.keyboard('{Escape}')

            expect(setSidebarVisible).not.toHaveBeenCalled()
        })

        it('closes when the location changes', async () => {
            // useNavigate is stubbed, so grab the real one from react-router's actual module
            const {useNavigate} = await vi.importActual<typeof import('react-router')>('react-router')
            let goTo!: ReturnType<typeof useRealNavigate>
            function NavigateHandle() {
                goTo = useNavigate()
                return null
            }
            render(
                <MemoryRouter initialEntries={['/']}>
                    <Sidebar sidebarVisible={true} setSidebarVisible={setSidebarVisible}/>
                    <NavigateHandle/>
                </MemoryRouter>,
            )
            setSidebarVisible.mockClear()

            await act(async () => {
                await goTo('/categories')
            })

            expect(setSidebarVisible).toHaveBeenCalledWith(false)
        })
    })

    describe('search', () => {
        it('goes to the search page with the encoded search term', async () => {
            const user = userEvent.setup()
            renderSidebar()

            await user.type(screen.getByLabelText('Search apps'), 'maths & science{Enter}')

            expect(navigate).toHaveBeenCalledWith('/search?q=maths%20%26%20science')
        })

        it('does nothing when the search term is empty', async () => {
            const user = userEvent.setup()
            renderSidebar()

            await user.type(screen.getByLabelText('Search apps'), '{Enter}')

            expect(navigate).not.toHaveBeenCalled()
        })
    })
})
