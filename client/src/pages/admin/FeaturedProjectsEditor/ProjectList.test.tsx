import {render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {ProjectList} from './ProjectList.tsx'

const {monitorForElements, stopMonitoring} = vi.hoisted(() => ({
    monitorForElements: vi.fn(),
    stopMonitoring: vi.fn(),
}))

// jsdom can't do real drag and drop, so capture the library's callback and call it ourselves
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({monitorForElements}))

type DropEvent = {
    source: {data: {index: number}}
    location: {current: {dropTargets: {data: {index: number}}[]}}
}

// Simulates dropping the item at sourceIndex onto the item at targetIndex (or onto nothing)
function drop(sourceIndex: number, targetIndex: number | null) {
    const calls = monitorForElements.mock.calls
    const {onDrop} = calls[calls.length - 1][0] as {onDrop: (event: DropEvent) => void}
    onDrop({
        source: {data: {index: sourceIndex}},
        location: {
            current: {dropTargets: targetIndex === null ? [] : [{data: {index: targetIndex}}]},
        },
    })
}

describe('ProjectList (featured projects editor)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        monitorForElements.mockReturnValue(stopMonitoring)
    })

    it('renders its children inside a list', () => {
        render(
            <ProjectList reorder={vi.fn()}>
                <li>First project</li>
                <li>Second project</li>
            </ProjectList>,
        )

        expect(screen.getByRole('list')).toBeInTheDocument()
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
        expect(screen.getByText('First project')).toBeInTheDocument()
    })

    describe('when an item is dropped', () => {
        it('asks to move the dragged item to the drop target position', () => {
            const reorder = vi.fn()
            render(<ProjectList reorder={reorder}><li>Item</li></ProjectList>)

            drop(0, 2)

            expect(reorder).toHaveBeenCalledTimes(1)
            expect(reorder).toHaveBeenCalledWith(0, 2)
        })

        it('does nothing when dropped back on its own position', () => {
            const reorder = vi.fn()
            render(<ProjectList reorder={reorder}><li>Item</li></ProjectList>)

            drop(1, 1)

            expect(reorder).not.toHaveBeenCalled()
        })

        it('does nothing when dropped outside any item', () => {
            const reorder = vi.fn()
            render(<ProjectList reorder={reorder}><li>Item</li></ProjectList>)

            drop(1, null)

            expect(reorder).not.toHaveBeenCalled()
        })

        it('uses the latest reorder function after a re-render', () => {
            const firstReorder = vi.fn()
            const secondReorder = vi.fn()
            const {rerender} = render(<ProjectList reorder={firstReorder}><li>Item</li></ProjectList>)

            rerender(<ProjectList reorder={secondReorder}><li>Item</li></ProjectList>)
            drop(0, 1)

            expect(secondReorder).toHaveBeenCalledWith(0, 1)
            expect(firstReorder).not.toHaveBeenCalled()
        })
    })

    it('stops listening for drops when it is removed', () => {
        const {unmount} = render(<ProjectList reorder={vi.fn()}><li>Item</li></ProjectList>)

        expect(stopMonitoring).not.toHaveBeenCalled()

        unmount()

        expect(stopMonitoring).toHaveBeenCalledTimes(1)
    })
})