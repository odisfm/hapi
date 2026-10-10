import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {Category} from '@hapi/shared/prisma/client'
import type {ProjectAdminType} from '@hapi/shared/types/project'
import {CategoryPicker} from './CategoryPicker.tsx'

const setProject = vi.fn()
const setHasChanged = vi.fn()

const categories = [
    {id: 'cat-1', name: 'Games'},
    {id: 'cat-2', name: 'Health'},
    {id: 'cat-3', name: 'Education'},
] as unknown as Category[]

function makeProject(selected: string[]) {
    return {
        id: 'project-1',
        name: 'Example project',
        categories: selected,
    } as unknown as ProjectAdminType
}

function renderPicker(selected: string[] = [], list: Category[] = categories) {
    return render(
        <CategoryPicker
            categories={list}
            project={makeProject(selected)}
            setProject={setProject}
            setHasChanged={setHasChanged}
        />,
    )
}

describe('CategoryPicker', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('listing', () => {
        it('shows a button for every category', () => {
            renderPicker()

            expect(screen.getAllByRole('listitem')).toHaveLength(3)
            expect(screen.getByRole('button', {name: 'Games'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Health'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Education'})).toBeInTheDocument()
        })

        it('shows nothing when there are no categories', () => {
            renderPicker([], [])

            expect(screen.queryByRole('button')).not.toBeInTheDocument()
        })

        it('does not change anything until a category is clicked', () => {
            renderPicker(['Games'])

            expect(setProject).not.toHaveBeenCalled()
            expect(setHasChanged).not.toHaveBeenCalled()
        })
    })

    describe('choosing a category', () => {
        it('adds an unselected category to the project', async () => {
            const user = userEvent.setup()
            renderPicker(['Games'])

            await user.click(screen.getByRole('button', {name: 'Health'}))

            expect(setProject).toHaveBeenCalledTimes(1)
            expect(setProject).toHaveBeenCalledWith(
                expect.objectContaining({id: 'project-1', categories: ['Games', 'Health']}),
            )
        })

        it('adds the first category to a project that has none', async () => {
            const user = userEvent.setup()
            renderPicker([])

            await user.click(screen.getByRole('button', {name: 'Education'}))

            expect(setProject).toHaveBeenCalledWith(expect.objectContaining({categories: ['Education']}))
        })

        it('marks the project as changed', async () => {
            const user = userEvent.setup()
            renderPicker([])

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(setHasChanged).toHaveBeenCalledWith(true)
        })
    })

    describe('removing a category', () => {
        it('removes a selected category and keeps the others in order', async () => {
            const user = userEvent.setup()
            renderPicker(['Games', 'Health', 'Education'])

            await user.click(screen.getByRole('button', {name: 'Health'}))

            expect(setProject).toHaveBeenCalledTimes(1)
            expect(setProject).toHaveBeenCalledWith(
                expect.objectContaining({categories: ['Games', 'Education']}),
            )
        })

        it('can remove the only selected category', async () => {
            const user = userEvent.setup()
            renderPicker(['Games'])

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(setProject).toHaveBeenCalledWith(expect.objectContaining({categories: []}))
        })

        it('marks the project as changed', async () => {
            const user = userEvent.setup()
            renderPicker(['Games'])

            await user.click(screen.getByRole('button', {name: 'Games'}))

            expect(setHasChanged).toHaveBeenCalledWith(true)
        })
    })

    it('can be used from the keyboard', async () => {
        const user = userEvent.setup()
        renderPicker([])

        await user.tab()
        await user.keyboard('{Enter}')

        expect(setProject).toHaveBeenCalledWith(expect.objectContaining({categories: ['Games']}))
    })
})