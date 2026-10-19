import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {ProjectListItem} from './ProjectListItem.tsx'

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
    draggable: vi.fn(() => () => {}),
    dropTargetForElements: vi.fn(() => () => {}),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
    attachClosestEdge: vi.fn((data: object) => data),
    extractClosestEdge: vi.fn(() => null),
}))

const toggleFeatured = vi.fn()

function renderItem(overrides: Partial<{featured: boolean; iconUrl: string}> = {}) {
    return render(
        <ul>
            <ProjectListItem
                name="Example project"
                projectId="project-123"
                versionId="version-123"
                slug="example-project"
                iconUrl="example-icon"
                featured={false}
                toggleFeatured={toggleFeatured}
                index={0}
                {...overrides}
                reorderSelf={() => {}}
            />
        </ul>,
    )
}

describe('ProjectListItem (featured projects editor)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows the project name and icon', () => {
        renderItem()

        expect(screen.getByText('Example project')).toBeInTheDocument()
        expect(screen.getByRole('img', {name: 'App icon'})).toBeInTheDocument()
    })

    it('links to the project editor in a new tab', () => {
        renderItem()

        const editLink = screen.getByRole('link')

        expect(editLink).toHaveAttribute('href', '/dashboard/project/version-123')
        expect(editLink).toHaveAttribute('target', '_blank')
    })

    describe('toggling featured', () => {
        it('calls toggleFeatured with the project id when the heart is clicked', async () => {
            const user = userEvent.setup()
            renderItem({featured: false})

            await user.click(screen.getByRole('button', {name: "Add favourite"}))

            expect(toggleFeatured).toHaveBeenCalledTimes(1)
            expect(toggleFeatured).toHaveBeenCalledWith('project-123')
        })

        it('also calls toggleFeatured when the project is already featured', async () => {
            const user = userEvent.setup()
            renderItem({featured: true})

            await user.click(screen.getByRole('button', {name: "Remove favourite"}))

            expect(toggleFeatured).toHaveBeenCalledWith('project-123')
        })
    })

    describe('reordering', () => {
        it('can be dragged when the project is featured', () => {
            renderItem({featured: true})

            expect(screen.getByRole('listitem')).toHaveAttribute('draggable', 'true')
        })

        it('cannot be dragged when the project is not featured', () => {
            renderItem({featured: false})

            expect(screen.getByRole('listitem')).toHaveAttribute('draggable', 'false')
        })
    })
})