import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectMediaType} from '@hapi/shared/types/projectMedia'
import {MediaCarousel} from './MediaCarousel.tsx'

const {dispatchImage} = vi.hoisted(() => ({
    dispatchImage: vi.fn(),
}))

vi.mock('../contexts/modal/useModal.ts', () => ({
    useModal: () => ({dispatchImage}),
}))

const firstScreenshot: ProjectMediaType = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    uri: 'first-screenshot',
    mediaType: 'SCREENSHOT',
    deviceType: 'DESKTOP',
    order: '1',
    status: 'AVAILABLE',
}

const secondScreenshot: ProjectMediaType = {
    id: '223e4567-e89b-42d3-a456-426614174001',
    uri: 'second-screenshot',
    mediaType: 'SCREENSHOT',
    deviceType: 'DESKTOP',
    order: '2',
    status: 'AVAILABLE',
}

function renderCarousel(
    overrides: Partial<{
        media: ProjectMediaType[]
        videoUrl: string | null
        projectName: string
    }> = {},
) {
    return render(
        <MediaCarousel
            media={[firstScreenshot]}
            videoUrl={null}
            projectName="Example project"
            {...overrides}
        />,
    )
}

describe('MediaCarousel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows each project screenshot as an accessible image', () => {
        renderCarousel({media: [firstScreenshot, secondScreenshot]})

        expect(screen.getAllByRole('img', {name: 'Example project screenshot'})).toHaveLength(2)
    })

    it('shows no screenshots when the media collection is empty', () => {
        renderCarousel({media: []})

        expect(screen.queryByRole('img', {name: 'Example project screenshot'})).not.toBeInTheDocument()
    })

    it('opens the clicked screenshot in the image modal', async () => {
        const user = userEvent.setup()
        renderCarousel()

        await user.click(screen.getByRole('img', {name: 'Example project screenshot'}))

        expect(dispatchImage).toHaveBeenCalledTimes(1)
        expect(dispatchImage).toHaveBeenCalledWith(
            expect.stringContaining('first-screenshot.webp'),
            'Example project screenshot',
            expect.anything(),
        )
    })

    it('opens the second screenshot when the second image is clicked', async () => {
        const user = userEvent.setup()
        renderCarousel({media: [firstScreenshot, secondScreenshot]})

        await user.click(screen.getAllByRole('img', {name: 'Example project screenshot'})[1])

        expect(dispatchImage).toHaveBeenCalledWith(
            expect.stringContaining('second-screenshot.webp'),
            'Example project screenshot',
            expect.anything(),
        )
    })
})