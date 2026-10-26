import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'
import type {ProjectMediaType} from '@hapi/shared/types/projectMedia'
import {MediaGroup} from './MediaGroup.tsx'

type DropArgs = {
    source: {data: Record<string, unknown>}
    location: {current: {dropTargets: {data: Record<string, unknown>}[]}}
}

// Capture the drop monitor so tests can simulate drops directly
const {monitorForElements, cleanup} = vi.hoisted(() => {
    const cleanup = vi.fn()
    return {
        cleanup,
        monitorForElements: vi.fn<(args: {onDrop: (args: DropArgs) => void}) => () => void>(() => cleanup),
    }
})

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
    monitorForElements,
    draggable: () => () => {},
    dropTargetForElements: () => () => {},
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
    attachClosestEdge: (data: Record<string, unknown>) => data,
    extractClosestEdge: (data: Record<string, unknown>) => data.edge ?? null,
}))

function makeScreenshot(n: number): ProjectMediaType {
    return {
        id: `${n}23e4567-e89b-42d3-a456-426614174000`,
        uri: `shot-${n}`,
        mediaType: 'SCREENSHOT',
        deviceType: 'PHONE',
        order: `0|${n}`,
        status: 'AVAILABLE',
    }
}

const media = [makeScreenshot(1), makeScreenshot(2), makeScreenshot(3)]
const onReorder = vi.fn()
const setActiveMedia = vi.fn()

function renderGroup(items: ProjectMediaType[] = media) {
    const result = render(
        <MediaGroup media={items} onReorder={onReorder} deviceType="PHONE" setActiveMedia={setActiveMedia}/>,
    )
    return {...result, onDrop: monitorForElements.mock.lastCall![0].onDrop}
}

function drop(source: number, target?: {index: number, edge?: string}): DropArgs {
    return {
        source: {data: {index: source}},
        location: {current: {dropTargets: target ? [{data: target}] : []}},
    }
}

describe('MediaGroup', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('display', () => {
        it('shows a tile for each screenshot in order', () => {
            renderGroup()

            expect(screen.getAllByRole('img').map((img) => img.getAttribute('alt')))
                .toEqual(['Screenshot 1', 'Screenshot 2', 'Screenshot 3'])
            expect(screen.queryByText('No screenshots for this device.')).not.toBeInTheDocument()
        })

        it('says when the device has no screenshots', () => {
            renderGroup([])

            expect(screen.getByText('No screenshots for this device.')).toBeInTheDocument()
        })

        it('selects a screenshot when its tile is clicked', async () => {
            const user = userEvent.setup()
            renderGroup()

            await user.click(screen.getByAltText('Screenshot 2'))

            expect(setActiveMedia).toHaveBeenCalledWith(media[1])
        })
    })

    describe('reordering', () => {
        it('reports the source and target positions for the device', () => {
            const {onDrop} = renderGroup()

            onDrop(drop(0, {index: 2, edge: 'right'}))

            expect(onReorder).toHaveBeenCalledWith('PHONE', 0, 2)
        })

        // The edge only adjusts a locally computed insert position, which is never used
        it.each([
            ['forwards onto a left edge', 0, 2, 'left'],
            ['backwards onto a right edge', 2, 0, 'right'],
            ['backwards onto a left edge', 2, 0, 'left'],
        ])('reports the raw positions when dragged %s', (_name, source, target, edge) => {
            const {onDrop} = renderGroup()

            onDrop(drop(source, {index: target, edge}))

            expect(onReorder).toHaveBeenCalledWith('PHONE', source, target)
        })

        it('ignores a drop outside any tile', () => {
            const {onDrop} = renderGroup()

            onDrop(drop(1))

            expect(onReorder).not.toHaveBeenCalled()
        })

        it('ignores a tile dropped onto itself', () => {
            const {onDrop} = renderGroup()

            onDrop(drop(1, {index: 1, edge: 'left'}))

            expect(onReorder).not.toHaveBeenCalled()
        })

        it('stops monitoring drops when unmounted', () => {
            const {unmount} = renderGroup()

            unmount()

            expect(cleanup).toHaveBeenCalled()
        })
    })
})
