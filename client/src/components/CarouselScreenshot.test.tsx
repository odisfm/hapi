import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {RefObject} from 'react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectMediaType} from '@hapi/shared/types/projectMedia'
import {CarouselScreenshot} from './CarouselScreenshot.tsx'

const media: ProjectMediaType = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    uri: 'example-screenshot',
    mediaType: 'SCREENSHOT',
    deviceType: 'DESKTOP',
    order: '1',
    status: 'AVAILABLE',
}

const openImage = vi.fn()
const updateMediaScrollState = vi.fn()
const setCarouselSidePadding = vi.fn()

function renderScreenshot(carouselRef: RefObject<HTMLDivElement | null> = {current: null}) {
    return render(
        <CarouselScreenshot
            media={media}
            openImage={openImage}
            projectName="Example project"
            updateMediaScrollState={updateMediaScrollState}
            mediaCarouselRef={carouselRef}
            setCarouselSidePadding={setCarouselSidePadding}
        />,
    )
}

function setWidth(element: HTMLElement, property: 'clientWidth' | 'offsetWidth', value: number) {
    Object.defineProperty(element, property, {value, configurable: true})
}

function createCarousel({carouselWidth, firstWidth, lastWidth}: {
    carouselWidth: number
    firstWidth: number
    lastWidth: number
}) {
    const carousel = document.createElement('div')
    const first = document.createElement('div')
    const last = document.createElement('div')
    carousel.append(first, last)
    setWidth(carousel, 'clientWidth', carouselWidth)
    setWidth(first, 'offsetWidth', firstWidth)
    setWidth(last, 'offsetWidth', lastWidth)
    return {current: carousel}
}

describe('CarouselScreenshot', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows the screenshot with an accessible name', () => {
        renderScreenshot()

        expect(screen.getByRole('img', {name: 'Example project screenshot'}))
            .toHaveAttribute('src', expect.stringContaining('example-screenshot.webp'))
    })

    it('opens the image when the screenshot is clicked', async () => {
        const user = userEvent.setup()
        renderScreenshot()

        await user.click(screen.getByRole('img', {name: 'Example project screenshot'}))

        expect(openImage).toHaveBeenCalledTimes(1)
    })

    it('does not open the image before it is clicked', () => {
        renderScreenshot()

        expect(openImage).not.toHaveBeenCalled()
    })

    describe('when the image finishes loading', () => {
        it('updates the carousel scroll state', () => {
            renderScreenshot()

            fireEvent.load(screen.getByRole('img', {name: 'Example project screenshot'}))

            expect(updateMediaScrollState).toHaveBeenCalledTimes(1)
        })

        it('leaves the side padding alone when the carousel is not mounted', () => {
            renderScreenshot({current: null})

            fireEvent.load(screen.getByRole('img', {name: 'Example project screenshot'}))

            expect(setCarouselSidePadding).not.toHaveBeenCalled()
        })

        it('centres the first and last items by padding each side', () => {
            const carouselRef = createCarousel({carouselWidth: 500, firstWidth: 100, lastWidth: 200})
            renderScreenshot(carouselRef)

            fireEvent.load(screen.getByRole('img', {name: 'Example project screenshot'}))

            expect(setCarouselSidePadding).toHaveBeenCalledWith({left: 200, right: 150})
        })

        it('never uses negative padding when an item is wider than the carousel', () => {
            const carouselRef = createCarousel({carouselWidth: 300, firstWidth: 400, lastWidth: 500})
            renderScreenshot(carouselRef)

            fireEvent.load(screen.getByRole('img', {name: 'Example project screenshot'}))

            expect(setCarouselSidePadding).toHaveBeenCalledWith({left: 0, right: 0})
        })
    })
})