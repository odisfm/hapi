import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'
import type {ProjectMediaType} from '@hapi/shared/types/projectMedia'
import {MediaTile} from './MediaTile.tsx'

type DraggableArgs = {
    getInitialData: () => Record<string, unknown>
    onDragStart: () => void
    onDrop: () => void
}

type DropTargetArgs = {
    onDrag: (args: {self: {data: Record<string, unknown>}}) => void
    onDragLeave: () => void
    onDrop: () => void
}

// Capture the drag-and-drop callbacks so tests can drive them directly
const {draggable, dropTargetForElements} = vi.hoisted(() => ({
    draggable: vi.fn<(args: DraggableArgs) => () => void>(() => () => {}),
    dropTargetForElements: vi.fn<(args: DropTargetArgs) => () => void>(() => () => {}),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({draggable, dropTargetForElements}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
    attachClosestEdge: (data: Record<string, unknown>) => data,
    extractClosestEdge: (data: Record<string, unknown>) => data.edge ?? null,
}))

const media: ProjectMediaType = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    uri: 'shot-uri',
    mediaType: 'SCREENSHOT',
    deviceType: 'PHONE',
    order: '0|hzzzzz:',
    status: 'AVAILABLE',
}

const setActiveMedia = vi.fn()

function renderTile(index = 2) {
    render(<MediaTile media={media} index={index} setActiveMedia={setActiveMedia}/>)
    return {
        drag: draggable.mock.lastCall![0],
        target: dropTargetForElements.mock.lastCall![0],
        tile: screen.getByAltText(`Screenshot ${index + 1}`).parentElement!,
    }
}

function edgeIndicator(tile: HTMLElement) {
    return tile.querySelector('.bg-blue-500')
}

describe('MediaTile', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('shows the screenshot numbered by its position', () => {
        renderTile(2)

        const img = screen.getByRole('img', {name: 'Screenshot 3'})
        expect(img).toHaveAttribute('src', expect.stringContaining('shot-uri.webp'))
    })

    it('selects the screenshot when clicked', async () => {
        const user = userEvent.setup()
        renderTile()

        await user.click(screen.getByRole('img'))

        expect(setActiveMedia).toHaveBeenCalledWith(media)
    })

    describe('dragging', () => {
        it('carries its index as drag data', () => {
            const {drag} = renderTile(4)

            expect(drag.getInitialData()).toEqual({index: 4})
        })

        it('fades while being dragged and restores once dropped', () => {
            const {drag, tile} = renderTile()

            act(() => drag.onDragStart())
            expect(tile).toHaveClass('opacity-50')

            act(() => drag.onDrop())
            expect(tile).not.toHaveClass('opacity-50')
        })
    })

    describe('drop indicator', () => {
        it('is hidden when nothing is dragged over the tile', () => {
            const {tile} = renderTile()

            expect(edgeIndicator(tile)).toBeNull()
        })

        it('marks the left edge when a tile is dragged over its left side', () => {
            const {target, tile} = renderTile()

            act(() => target.onDrag({self: {data: {edge: 'left'}}}))

            expect(edgeIndicator(tile)).toHaveClass('left-0')
        })

        it('marks the right edge when a tile is dragged over its right side', () => {
            const {target, tile} = renderTile()

            act(() => target.onDrag({self: {data: {edge: 'right'}}}))

            expect(edgeIndicator(tile)).toHaveClass('right-0')
        })

        it('disappears when the dragged tile leaves', () => {
            const {target, tile} = renderTile()
            act(() => target.onDrag({self: {data: {edge: 'left'}}}))

            act(() => target.onDragLeave())

            expect(edgeIndicator(tile)).toBeNull()
        })

        it('disappears when the dragged tile is dropped', () => {
            const {target, tile} = renderTile()
            act(() => target.onDrag({self: {data: {edge: 'right'}}}))

            act(() => target.onDrop())

            expect(edgeIndicator(tile)).toBeNull()
        })
    })
})
