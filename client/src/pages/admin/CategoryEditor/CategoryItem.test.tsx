import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import type {CategoryType} from '@hapi/shared/types/apiResponses'
import {CategoryItem} from './CategoryItem.tsx'

const category: CategoryType = {
    id: 'category-1',
    name: 'Games',
    projectCount: 3,
}

function renderItem(overrides: Partial<CategoryType> = {}) {
    const deleteFn = vi.fn()
    const renameFn = vi.fn()
    render(
        <ul>
            <CategoryItem data={{...category, ...overrides}} deleteFn={deleteFn} renameFn={renameFn}/>
        </ul>,
    )
    return {deleteFn, renameFn, user: userEvent.setup()}
}

describe('CategoryItem', () => {
    describe('display', () => {
        it('shows the name and project count', () => {
            renderItem()

            expect(screen.getByText('Games')).toBeInTheDocument()
            expect(screen.getByText('3 projects')).toBeInTheDocument()
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
        })

        it('uses the singular for one project', () => {
            renderItem({projectCount: 1})

            expect(screen.getByText('1 project')).toBeInTheDocument()
        })

        it('uses the plural for no projects', () => {
            renderItem({projectCount: 0})

            expect(screen.getByText('0 projects')).toBeInTheDocument()
        })
    })

    describe('deleting', () => {
        it('calls the delete function with the category id', async () => {
            const {deleteFn, user} = renderItem()

            await user.click(screen.getByRole('button', {name: 'delete category'}))

            expect(deleteFn).toHaveBeenCalledWith('category-1')
        })
    })

    describe('renaming', () => {
        it('shows a focused input with the current name', async () => {
            const {user} = renderItem()

            await user.click(screen.getByRole('button', {name: 'rename'}))

            expect(screen.getByRole('textbox')).toHaveValue('Games')
            expect(screen.getByRole('textbox')).toHaveFocus()
            expect(screen.getByRole('button', {name: 'cancel rename'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'submit rename'})).toBeInTheDocument()
        })

        it('submits the new name and leaves rename mode', async () => {
            const {renameFn, user} = renderItem()
            await user.click(screen.getByRole('button', {name: 'rename'}))

            await user.clear(screen.getByRole('textbox'))
            await user.type(screen.getByRole('textbox'), 'Puzzles')
            await user.click(screen.getByRole('button', {name: 'submit rename'}))

            expect(renameFn).toHaveBeenCalledWith('category-1', 'Puzzles')
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
        })

        it('submits when Enter is pressed', async () => {
            const {renameFn, user} = renderItem()
            await user.click(screen.getByRole('button', {name: 'rename'}))

            await user.type(screen.getByRole('textbox'), ' 2{Enter}')

            expect(renameFn).toHaveBeenCalledWith('category-1', 'Games 2')
        })

        it('ignores an empty name and stays in rename mode', async () => {
            const {renameFn, user} = renderItem()
            await user.click(screen.getByRole('button', {name: 'rename'}))

            await user.clear(screen.getByRole('textbox'))
            await user.click(screen.getByRole('button', {name: 'submit rename'}))

            expect(renameFn).not.toHaveBeenCalled()
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('can be cancelled without renaming', async () => {
            const {renameFn, user} = renderItem()
            await user.click(screen.getByRole('button', {name: 'rename'}))

            await user.click(screen.getByRole('button', {name: 'cancel rename'}))

            expect(renameFn).not.toHaveBeenCalled()
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            expect(screen.getByText('Games')).toBeInTheDocument()
        })
    })
})
