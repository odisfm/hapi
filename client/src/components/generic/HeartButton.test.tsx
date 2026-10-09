import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {HeartButton} from './HeartButton.tsx'

const toggle = vi.fn()

describe('HeartButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders a single button', () => {
        render(<HeartButton active={false} toggle={toggle}/>)

        expect(screen.getAllByRole('button')).toHaveLength(1)
    })

    it('does not call toggle before it is clicked', () => {
        render(<HeartButton active={false} toggle={toggle}/>)

        expect(toggle).not.toHaveBeenCalled()
    })

    it.each([
        ['inactive', false],
        ['active', true],
    ])('calls toggle once when clicked while %s', async (_label, active) => {
        const user = userEvent.setup()
        render(<HeartButton active={active} toggle={toggle}/>)

        await user.click(screen.getByRole('button'))

        expect(toggle).toHaveBeenCalledTimes(1)
    })

    it('can be activated from the keyboard', async () => {
        const user = userEvent.setup()
        render(<HeartButton active={false} toggle={toggle}/>)

        await user.tab()
        await user.keyboard('{Enter}')

        expect(toggle).toHaveBeenCalledTimes(1)
    })
})