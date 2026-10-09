import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectPreviewType} from '@hapi/shared/types/project'
import {HeroProjectCard} from './HeroProjectCard.tsx'

const {navigate} = vi.hoisted(() => ({navigate: vi.fn()}))

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

const project: ProjectPreviewType = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    name: 'Example project',
    subtitle: 'A project subtitle',
    iconUrl: 'example-icon',
    order: '1',
    slug: 'example-project',
    developers: ['Example developer'],
    featured: true,
}

function renderCard(projectOverrides: Partial<ProjectPreviewType> = {}) {
    return render(
        <MemoryRouter>
            <HeroProjectCard project={{...project, ...projectOverrides}} />
        </MemoryRouter>,
    )
}

describe('HeroProjectCard', () => {
    beforeEach(() => {
        navigate.mockClear()
    })

    describe('without hero artwork', () => {
        it('shows the project name, subtitle and icon', () => {
            renderCard()

            expect(screen.getByRole('heading', {name: 'Example project'})).toBeInTheDocument()
            expect(screen.getByText('A project subtitle')).toBeInTheDocument()
            expect(screen.getByRole('img', {name: 'App icon'})).toBeInTheDocument()
        })

        it('does not show the featured artwork', () => {
            renderCard()

            expect(screen.queryByRole('img', {name: /featured project/i})).not.toBeInTheDocument()
        })
    })

    describe('with hero artwork', () => {
        it('shows the artwork from the project\'s artwork URL', () => {
            renderCard({heroArtUrl: 'example-hero-art'})

            expect(screen.getByRole('img', {name: 'Example project featured project'}))
                .toHaveAttribute('src', expect.stringContaining('example-hero-art.webp'))
        })

        it('shows the name, subtitle and icon in the footer bar instead of a heading', () => {
            renderCard({heroArtUrl: 'example-hero-art'})

            expect(screen.queryByRole('heading', {name: 'Example project'})).not.toBeInTheDocument()
            expect(screen.getByText('Example project')).toBeInTheDocument()
            expect(screen.getByText('A project subtitle')).toBeInTheDocument()
            expect(screen.getByRole('img', {name: 'App icon'})).toBeInTheDocument()
        })
    })

    it.each([
        ['without hero artwork', {}],
        ['with hero artwork', {heroArtUrl: 'example-hero-art'}],
    ])('navigates to the project page when VIEW is clicked %s', async (_label, overrides) => {
        const user = userEvent.setup()
        renderCard(overrides)

        await user.click(screen.getByRole('button', {name: 'VIEW'}))

        expect(navigate).toHaveBeenCalledWith('/project/example-project')
    })
})