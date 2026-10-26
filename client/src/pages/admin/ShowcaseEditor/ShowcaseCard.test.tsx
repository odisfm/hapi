import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {ShowcaseCard} from './ShowcaseCard.tsx'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

const showcaseId = '123e4567-e89b-42d3-a456-426614174000'

function renderCard(overrides: Partial<Parameters<typeof ShowcaseCard>[0]> = {}) {
    return render(
        <ShowcaseCard
            name="Spring Showcase"
            id={showcaseId}
            projectCount={3}
            publishedDate={null}
            {...overrides}
        />,
    )
}

describe('ShowcaseCard', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('shows the showcase name and id', () => {
        renderCard()

        expect(screen.getByText('Spring Showcase')).toBeInTheDocument()
        expect(screen.getByText(`id: ${showcaseId}`)).toBeInTheDocument()
    })

    describe('publish date', () => {
        it('shows the formatted publish date', () => {
            renderCard({publishedDate: new Date(2025, 2, 7, 9, 5)})

            expect(screen.getByText('07/3/2025 09:05')).toBeInTheDocument()
        })

        it('says no date is set when there is none', () => {
            renderCard({publishedDate: null})

            expect(screen.getByText('No date set')).toBeInTheDocument()
        })
    })

    describe('project count', () => {
        it('uses the singular for one project', () => {
            renderCard({projectCount: 1})

            expect(screen.getByText('1 project')).toBeInTheDocument()
        })

        it('uses the plural for several projects', () => {
            renderCard({projectCount: 3})

            expect(screen.getByText('3 projects')).toBeInTheDocument()
        })

        it('uses the plural for no projects', () => {
            renderCard({projectCount: 0})

            expect(screen.getByText('0 projects')).toBeInTheDocument()
        })
    })

    it('opens the showcase editor when Edit is clicked', async () => {
        const user = userEvent.setup()
        renderCard()

        await user.click(screen.getByRole('button', {name: 'Edit'}))

        expect(navigate).toHaveBeenCalledWith(`/dashboard/showcase/${showcaseId}`)
    })
})
