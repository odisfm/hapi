import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {Paginator} from './Paginator.tsx'

const setPage = vi.fn()

describe('Paginator', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows one numbered button per page, starting at 1', () => {
        render(<Paginator pageCount={3} activePage={0} setPage={setPage}/>)

        expect(screen.getAllByRole('button')).toHaveLength(3)
        expect(screen.getByRole('button', {name: '1'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: '2'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: '3'})).toBeInTheDocument()
    })

    it('shows no page buttons when there are no pages', () => {
        render(<Paginator pageCount={0} activePage={0} setPage={setPage}/>)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('is exposed as a navigation landmark', () => {
        render(<Paginator pageCount={2} activePage={0} setPage={setPage}/>)

        expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('calls setPage with the zero-based index of the clicked page', async () => {
        const user = userEvent.setup()
        render(<Paginator pageCount={3} activePage={0} setPage={setPage}/>)

        await user.click(screen.getByRole('button', {name: '3'}))

        expect(setPage).toHaveBeenCalledTimes(1)
        expect(setPage).toHaveBeenCalledWith(2)
    })

    it('still calls setPage when the active page is clicked', async () => {
        const user = userEvent.setup()
        render(<Paginator pageCount={3} activePage={1} setPage={setPage}/>)

        await user.click(screen.getByRole('button', {name: '2'}))

        expect(setPage).toHaveBeenCalledWith(1)
    })

    it('does not call setPage before anything is clicked', () => {
        render(<Paginator pageCount={3} activePage={0} setPage={setPage}/>)

        expect(setPage).not.toHaveBeenCalled()
    })
})