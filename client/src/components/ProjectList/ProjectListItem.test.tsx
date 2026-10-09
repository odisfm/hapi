import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {describe, expect, it} from 'vitest'
import type {ProjectPreviewType} from '@hapi/shared/types/project'
import {ProjectListItem} from './ProjectListItem.tsx'

const project: ProjectPreviewType = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    name: 'Example project',
    subtitle: 'A project subtitle',
    iconUrl: 'example-icon',
    order: '1',
    slug: 'example-project',
    developers: ['Alice'],
    featured: false,
}

const editorPath = `/dashboard/project/${project.id}`

function renderItem(overrides: Partial<ProjectPreviewType> = {}) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ul>
                            <ProjectListItem project={{...project, ...overrides}}/>
                        </ul>
                    }
                />
                <Route path="/dashboard/project/:id" element={<h1>Project editor</h1>}/>
            </Routes>
        </MemoryRouter>,
    )
}

describe('ProjectListItem (project list)', () => {
    it('shows the project name and icon', () => {
        renderItem()

        expect(screen.getByRole('link', {name: 'Example project'})).toBeInTheDocument()
        expect(screen.getByRole('img', {name: 'App icon'})).toBeInTheDocument()
    })

    describe('developers', () => {
        it('shows a single developer', () => {
            renderItem({developers: ['Alice']})

            expect(screen.getByText('Alice')).toBeInTheDocument()
        })

        it('shows several developers separated by commas', () => {
            renderItem({developers: ['Alice', 'Bob', 'Chen']})

            expect(screen.getByText('Alice, Bob, Chen')).toBeInTheDocument()
        })

        it('shows no developer text when there are none', () => {
            renderItem({developers: []})

            expect(screen.queryByText(/alice/i)).not.toBeInTheDocument()
            expect(screen.getByRole('link', {name: 'Example project'})).toBeInTheDocument()
        })
    })

    describe('editing', () => {
        it('links the project name and the Edit button to the project editor', () => {
            renderItem()

            expect(screen.getByRole('link', {name: 'Example project'})).toHaveAttribute('href', editorPath)
            expect(screen.getByRole('link', {name: 'Edit'})).toHaveAttribute('href', editorPath)
        })

        it('opens the project editor when Edit is clicked', async () => {
            const user = userEvent.setup()
            renderItem()

            await user.click(screen.getByRole('link', {name: 'Edit'}))

            expect(screen.getByRole('heading', {name: 'Project editor'})).toBeInTheDocument()
            expect(screen.queryByRole('link', {name: 'Edit'})).not.toBeInTheDocument()
        })
    })
})