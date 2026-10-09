import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {describe, expect, it} from 'vitest'
import ProjectCard from './ProjectCard.tsx'

const project = {
    name: 'Example project',
    subtitle: 'A project subtitle',
    iconUrl: 'example-icon',
    slug: 'example-project',
}

function renderCard(overrides: Partial<typeof project> = {}) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<ProjectCard {...project} {...overrides} />} />
                <Route path="/project/:slug" element={<h1>Project page</h1>} />
            </Routes>
        </MemoryRouter>,
    )
}

describe('ProjectCard', () => {
    it('shows the project name, subtitle and icon', () => {
        renderCard()

        expect(screen.getByRole('heading', {name: 'Example project'})).toBeInTheDocument()
        expect(screen.getByText('A project subtitle')).toBeInTheDocument()
        expect(screen.getByRole('img', {name: 'App icon'})).toBeInTheDocument()
    })

    it('links to the project page', () => {
        renderCard()

        expect(screen.getByRole('link', {name: /Example project.*A project subtitle/i}))
            .toHaveAttribute('href', '/project/example-project')
    })

    it('URL-encodes the slug in the link', () => {
        renderCard({slug: 'example project'})

        expect(screen.getByRole('link', {name: /Example project/i}))
            .toHaveAttribute('href', '/project/example%20project')
    })

    it('opens the project page when the card is clicked', async () => {
        const user = userEvent.setup()
        renderCard()

        await user.click(screen.getByRole('link', {name: /Example project.*A project subtitle/i}))

        expect(screen.getByRole('heading', {name: 'Project page'})).toBeInTheDocument()
        expect(screen.queryByRole('heading', {name: 'Example project'})).not.toBeInTheDocument()
    })
})