import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {SearchOrderPicker} from './SearchOrderPicker.tsx'

function renderPicker(fn = vi.fn()) {
    render(
        <SearchOrderPicker
            activeStrategy={'nameAsc'}
            strategies={['default', 'nameAsc', 'dateDesc']}
            fn={fn}
        />,
    )
    return fn
}

describe('SearchOrderPicker', () => {
    it('shows the active strategy while closed', () => {
        renderPicker()

        expect(screen.getByRole('button', {name: 'A-Z'})).toBeInTheDocument()
        expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('lists every strategy when opened', async () => {
        const user = userEvent.setup()
        renderPicker()

        await user.click(screen.getByRole('button', {name: 'A-Z'}))

        expect(screen.getByRole('button', {name: 'Sort by'})).toBeInTheDocument()
        const options = screen.getAllByRole('listitem').map((li) => li.textContent)
        expect(options).toEqual(['Relevance', 'A-Z', 'Newest'])
    })

    it('highlights the active strategy', async () => {
        const user = userEvent.setup()
        renderPicker()

        await user.click(screen.getByRole('button', {name: 'A-Z'}))

        expect(screen.getByRole('button', {name: 'A-Z'})).toHaveClass('font-bold')
        expect(screen.getByRole('button', {name: 'Newest'})).not.toHaveClass('font-bold')
    })

    it('closes again when the toggle is clicked twice', async () => {
        const user = userEvent.setup()
        renderPicker()

        await user.click(screen.getByRole('button', {name: 'A-Z'}))
        await user.click(screen.getByRole('button', {name: 'Sort by'}))

        expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('picks a strategy and closes', async () => {
        const user = userEvent.setup()
        const fn = renderPicker()

        await user.click(screen.getByRole('button', {name: 'A-Z'}))
        await user.click(screen.getByRole('button', {name: 'Newest'}))

        expect(fn).toHaveBeenCalledExactlyOnceWith('dateDesc')
        expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
})
