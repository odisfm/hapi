import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'
import type {ProjectVersionSummaryType} from '@hapi/shared/types/project'
import {ProjectListItem} from './ProjectListItem.tsx'

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const summary: ProjectVersionSummaryType = {
    name: 'Example project',
    projectId: '123e4567-e89b-42d3-a456-426614174000',
    projectSlug: 'example-project',
    alternateVersion: {
        id: '223e4567-e89b-42d3-a456-426614174000',
        status: 'PENDING',
    },
    users: [{id: '323e4567-e89b-42d3-a456-426614174000', name: 'Alice'}],
    feedbackHistory: [],
}

function renderItem(overrides: Partial<ProjectVersionSummaryType> = {}) {
    return render(
        <ul>
            <ProjectListItem summary={{...summary, ...overrides}}/>
        </ul>,
    )
}

function rowValue(label: string) {
    const row = screen.getByRole('cell', {name: label}).closest('tr')!
    return within(row).getAllByRole('cell')[1].textContent
}

describe('ProjectListItem (project queue)', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('shows the project name', () => {
        renderItem()

        expect(rowValue('Project name')).toBe('Example project')
    })

    describe('students', () => {
        it('labels a single student in the singular', () => {
            renderItem()

            expect(rowValue('Student')).toBe('Alice')
        })

        it('labels several students in the plural and joins their names', () => {
            renderItem({users: [
                {id: '323e4567-e89b-42d3-a456-426614174000', name: 'Alice'},
                {id: '423e4567-e89b-42d3-a456-426614174000', name: 'Bob'},
            ]})

            expect(rowValue('Students')).toBe('Alice, Bob')
        })
    })

    describe('feedback history', () => {
        it('is hidden when there is no previous feedback', () => {
            renderItem()

            expect(screen.queryByRole('heading', {name: 'Feedback history'})).not.toBeInTheDocument()
        })

        it('lists previous feedback and opens it in a modal', async () => {
            const user = userEvent.setup()
            renderItem({feedbackHistory: [
                {reviewedAt: new Date(), reviewer: 'Dr Smith', feedback: 'Needs screenshots'},
            ]})

            await user.click(screen.getByRole('button', {name: 'View feedback'}))

            expect(screen.getByRole('heading', {name: 'Feedback history'})).toBeInTheDocument()
            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: expect.stringContaining('Dr Smith'),
            }))
        })
    })

    it('opens the version under review when Review is clicked', async () => {
        const user = userEvent.setup()
        renderItem()

        await user.click(screen.getByRole('button', {name: 'Review'}))

        expect(navigate).toHaveBeenCalledWith(`/dashboard/project/${summary.alternateVersion!.id}`)
    })
})
