import {act, fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useEffect} from 'react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ModalContextValue} from './ModalContext.tsx'
import {ModalProvider} from './ModalProvider.tsx'
import {useModal} from './useModal.ts'

let modal: ModalContextValue

function Consumer() {
    const context = useModal()
    useEffect(() => {
        modal = context
    }, [context])
    return <p>Page content</p>
}

function renderProvider() {
    return render(
        <ModalProvider>
            <Consumer/>
        </ModalProvider>,
    )
}

function openModal(...args: Parameters<ModalContextValue['dispatchModal']>) {
    let result!: Promise<string>
    act(() => {
        result = modal.dispatchModal(...args)
    })
    return result
}

function openImage(...args: Parameters<ModalContextValue['dispatchImage']>) {
    let result!: Promise<string>
    act(() => {
        result = modal.dispatchImage(...args)
    })
    return result
}

describe('ModalProvider', () => {
    beforeEach(() => {
        // the modal list renders without keys
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders its children', () => {
        renderProvider()

        expect(screen.getByText('Page content')).toBeInTheDocument()
    })

    it('throws when useModal is used outside the provider', () => {
        expect(() => render(<Consumer/>)).toThrow('useModal must be used within a ModalProvider')
    })

    describe('dispatchModal', () => {
        it('shows the headline and each line of a string body as a paragraph', () => {
            renderProvider()
            void openModal({headline: 'Heads up', body: 'First line\nSecond line'})

            expect(screen.getByRole('heading', {name: 'Heads up'})).toBeInTheDocument()
            expect(screen.getByText('First line').tagName).toBe('P')
            expect(screen.getByText('Second line').tagName).toBe('P')
        })

        it('shows an element body as given', () => {
            renderProvider()
            void openModal({body: <strong>Custom body</strong>})

            expect(screen.getByText('Custom body').tagName).toBe('STRONG')
            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })

        it('shows a single "Ok" button when no buttons are given', () => {
            renderProvider()
            void openModal({headline: 'Done'})

            expect(screen.getAllByRole('button')).toHaveLength(1)
            expect(screen.getByRole('button', {name: 'Ok'})).toBeInTheDocument()
        })

        it('resolves with the id of the clicked button and closes', async () => {
            const user = userEvent.setup()
            renderProvider()
            const result = openModal({
                headline: 'Delete?',
                buttons: [
                    {id: 'cancel', text: 'Cancel', variant: 'default'},
                    {id: 'confirm', text: 'Delete', variant: 'danger'},
                ],
            })

            await user.click(screen.getByRole('button', {name: 'Delete'}))

            await expect(result).resolves.toBe('confirm')
            expect(screen.queryByRole('heading', {name: 'Delete?'})).not.toBeInTheDocument()
        })

        it('shows queued modals together and only closes the one answered', async () => {
            const user = userEvent.setup()
            renderProvider()
            const first = openModal({headline: 'First', buttons: [{id: 'a', text: 'Answer first', variant: 'default'}]})
            void openModal({headline: 'Second', buttons: [{id: 'b', text: 'Answer second', variant: 'default'}]})

            await user.click(screen.getByRole('button', {name: 'Answer first'}))

            await expect(first).resolves.toBe('a')
            expect(screen.queryByRole('heading', {name: 'First'})).not.toBeInTheDocument()
            expect(screen.getByRole('heading', {name: 'Second'})).toBeInTheDocument()
        })
    })

    describe('dispatchImage', () => {
        it('shows the image with its alt text and a dismiss button', () => {
            renderProvider()
            void openImage('https://example.com/a.png', 'A screenshot')

            expect(screen.getByRole('img', {name: 'A screenshot'})).toHaveAttribute('src', 'https://example.com/a.png')
            expect(screen.getByRole('button', {name: 'dismiss image'})).toBeInTheDocument()
        })

        it('shows no navigation buttons without navigation', () => {
            renderProvider()
            void openImage('a.png', 'A screenshot')

            expect(screen.queryByRole('button', {name: 'previous image'})).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'next image'})).not.toBeInTheDocument()
        })

        it('closes and resolves when clicked anywhere', async () => {
            const user = userEvent.setup()
            renderProvider()
            const result = openImage('a.png', 'A screenshot')

            await user.click(screen.getByRole('button', {name: 'dismiss image'}))

            await expect(result).resolves.toBe('')
            expect(screen.queryByRole('img')).not.toBeInTheDocument()
        })

        it('replaces an image that is already showing', () => {
            renderProvider()
            void openImage('a.png', 'First image')
            void openImage('b.png', 'Second image')

            expect(screen.queryByRole('img', {name: 'First image'})).not.toBeInTheDocument()
            expect(screen.getByRole('img', {name: 'Second image'})).toBeInTheDocument()
        })

        describe('navigation', () => {
            it('calls previous and next from their buttons without closing', async () => {
                const user = userEvent.setup()
                const previous = vi.fn()
                const next = vi.fn()
                renderProvider()
                void openImage('a.png', 'A screenshot', {previous, next})

                await user.click(screen.getByRole('button', {name: 'previous image'}))
                await user.click(screen.getByRole('button', {name: 'next image'}))

                expect(previous).toHaveBeenCalledTimes(1)
                expect(next).toHaveBeenCalledTimes(1)
                expect(screen.getByRole('img', {name: 'A screenshot'})).toBeInTheDocument()
            })

            it('disables the button for a missing direction', () => {
                renderProvider()
                void openImage('a.png', 'A screenshot', {next: vi.fn()})

                expect(screen.getByRole('button', {name: 'previous image'})).toBeDisabled()
                expect(screen.getByRole('button', {name: 'next image'})).toBeEnabled()
            })

            it('disables both buttons when navigation has no directions', () => {
                renderProvider()
                void openImage('a.png', 'A screenshot', {})

                expect(screen.getByRole('button', {name: 'previous image'})).toBeDisabled()
                expect(screen.getByRole('button', {name: 'next image'})).toBeDisabled()
            })

            it('uses the arrow keys to navigate', async () => {
                const user = userEvent.setup()
                const previous = vi.fn()
                const next = vi.fn()
                renderProvider()
                void openImage('a.png', 'A screenshot', {previous, next})

                await user.keyboard('{ArrowLeft}')
                expect(previous).toHaveBeenCalledTimes(1)

                await user.keyboard('{ArrowRight}')
                expect(next).toHaveBeenCalledTimes(1)
            })

            it('prevents the default arrow key behaviour', () => {
                renderProvider()
                void openImage('a.png', 'A screenshot', {previous: vi.fn(), next: vi.fn()})

                expect(fireEvent.keyDown(window, {key: 'ArrowLeft'})).toBe(false)
                expect(fireEvent.keyDown(window, {key: 'ArrowRight'})).toBe(false)
            })

            it('ignores arrow keys for a missing direction', async () => {
                const user = userEvent.setup()
                renderProvider()
                void openImage('a.png', 'A screenshot')

                await user.keyboard('{ArrowLeft}{ArrowRight}')

                expect(screen.getByRole('img', {name: 'A screenshot'})).toBeInTheDocument()
            })

            it('ignores other keys', async () => {
                const user = userEvent.setup()
                const previous = vi.fn()
                const next = vi.fn()
                renderProvider()
                void openImage('a.png', 'A screenshot', {previous, next})

                await user.keyboard('{Enter}')

                expect(previous).not.toHaveBeenCalled()
                expect(next).not.toHaveBeenCalled()
                expect(screen.getByRole('img', {name: 'A screenshot'})).toBeInTheDocument()
            })
        })

        it('closes when Escape is pressed', async () => {
            const user = userEvent.setup()
            renderProvider()
            void openImage('a.png', 'A screenshot')

            await user.keyboard('{Escape}')

            expect(screen.queryByRole('img')).not.toBeInTheDocument()
        })

        it('stops listening for keys once closed', async () => {
            const user = userEvent.setup()
            const previous = vi.fn()
            renderProvider()
            void openImage('a.png', 'A screenshot', {previous})

            await user.keyboard('{Escape}')
            await user.keyboard('{ArrowLeft}')

            expect(previous).not.toHaveBeenCalled()
        })
    })
})
