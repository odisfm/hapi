import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {Button} from './Button.tsx'

const onClick = vi.fn()
const onSubmit = vi.fn()

function renderInForm(button: React.ReactNode) {
    return render(
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}
        >
            {button}
        </form>,
    )
}

describe('Button', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows its children as the button label', () => {
        render(<Button>Save changes</Button>)

        expect(screen.getByRole('button', {name: 'Save changes'})).toBeInTheDocument()
    })

    it('uses ariaLabel as the accessible name when provided', () => {
        render(<Button ariaLabel="Close dialog">X</Button>)

        expect(screen.getByRole('button', {name: 'Close dialog'})).toBeInTheDocument()
        expect(screen.queryByRole('button', {name: 'X'})).not.toBeInTheDocument()
    })

    describe('clicking', () => {
        it('calls onClick once when clicked', async () => {
            const user = userEvent.setup()
            render(<Button onClick={onClick}>Go</Button>)

            await user.click(screen.getByRole('button', {name: 'Go'}))

            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('does not throw when clicked without an onClick handler', async () => {
            const user = userEvent.setup()
            render(<Button>Go</Button>)

            await user.click(screen.getByRole('button', {name: 'Go'}))

            expect(screen.getByRole('button', {name: 'Go'})).toBeInTheDocument()
        })

        it('can be activated from the keyboard', async () => {
            const user = userEvent.setup()
            render(<Button onClick={onClick}>Go</Button>)

            await user.tab()
            await user.keyboard('{Enter}')

            expect(onClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('when disabled', () => {
        it('is disabled', () => {
            render(<Button disabled>Go</Button>)

            expect(screen.getByRole('button', {name: 'Go'})).toBeDisabled()
        })

        it('does not call onClick when clicked', async () => {
            const user = userEvent.setup()
            render(<Button disabled onClick={onClick}>Go</Button>)

            await user.click(screen.getByRole('button', {name: 'Go'}))

            expect(onClick).not.toHaveBeenCalled()
        })
    })

    it('is enabled by default', () => {
        render(<Button>Go</Button>)

        expect(screen.getByRole('button', {name: 'Go'})).toBeEnabled()
    })

    describe('inside a form', () => {
        it('does not submit the form by default', async () => {
            const user = userEvent.setup()
            renderInForm(<Button>Save</Button>)

            await user.click(screen.getByRole('button', {name: 'Save'}))

            expect(onSubmit).not.toHaveBeenCalled()
        })

        it('submits the form when buttonType is submit', async () => {
            const user = userEvent.setup()
            renderInForm(<Button buttonType="submit">Save</Button>)

            await user.click(screen.getByRole('button', {name: 'Save'}))

            expect(onSubmit).toHaveBeenCalledTimes(1)
        })

        it('does not submit the form when a submit button is disabled', async () => {
            const user = userEvent.setup()
            renderInForm(<Button buttonType="submit" disabled>Save</Button>)

            await user.click(screen.getByRole('button', {name: 'Save'}))

            expect(onSubmit).not.toHaveBeenCalled()
        })
    })
})