import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {SaveButton} from './SaveButton.tsx'

const onClick = vi.fn()
const onSubmit = vi.fn()

function renderInForm(hasChanged: boolean) {
    return render(
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}
        >
            <SaveButton onClick={onClick} hasChanged={hasChanged}/>
        </form>,
    )
}

describe('SaveButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('when there are changes', () => {
        it('shows a save button that is enabled', () => {
            renderInForm(true)

            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
        })

        it('does not show the "no changes" label', () => {
            renderInForm(true)

            expect(screen.queryByRole('button', {name: 'no changes'})).not.toBeInTheDocument()
        })

        it('calls onClick when clicked', async () => {
            const user = userEvent.setup()
            renderInForm(true)

            await user.click(screen.getByRole('button', {name: 'save'}))

            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('submits the surrounding form when clicked', async () => {
            const user = userEvent.setup()
            renderInForm(true)

            await user.click(screen.getByRole('button', {name: 'save'}))

            expect(onSubmit).toHaveBeenCalledTimes(1)
        })
    })

    describe('when there are no changes', () => {
        it('shows a "no changes" button that is disabled', () => {
            renderInForm(false)

            expect(screen.getByRole('button', {name: 'no changes'})).toBeDisabled()
        })

        it('does not show the save label', () => {
            renderInForm(false)

            expect(screen.queryByRole('button', {name: 'save'})).not.toBeInTheDocument()
        })

        it('does not call onClick or submit the form when clicked', async () => {
            const user = userEvent.setup()
            renderInForm(false)

            await user.click(screen.getByRole('button', {name: 'no changes'}))

            expect(onClick).not.toHaveBeenCalled()
            expect(onSubmit).not.toHaveBeenCalled()
        })
    })
})