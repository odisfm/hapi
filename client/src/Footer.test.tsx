import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { Footer } from './Footer.tsx'

function renderFooter() {
    return render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>,
    )
}

describe('Footer', () => {
    it('renders as the page footer landmark', () => {
        renderFooter()

        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('shows the RMIT logo', () => {
        renderFooter()

        expect(screen.getByRole('img', { name: 'RMIT' })).toHaveAttribute('src', '/rmit-logo-red.png')
    })

    it('shows the HAPI name and tagline', () => {
        renderFooter()

        expect(screen.getByText(/RMIT HAPI/)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /hub for apple innovation/i })).toBeInTheDocument()
    })

    it('describes what HAPI does', () => {
        renderFooter()

        expect(screen.getByText(/empowers them to make impactful contributions/i)).toBeInTheDocument()
    })

    it('links to the admin login page', () => {
        renderFooter()

        expect(screen.getByRole('link', { name: 'Admin Login' })).toHaveAttribute('href', '/admin-login')
    })
})