import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer.tsx'

describe('Footer', () => {
    it('renders as the page footer landmark', () => {
        render(<Footer />)

        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('shows the RMIT logo', () => {
        render(<Footer />)

        expect(screen.getByRole('img', { name: 'RMIT' })).toHaveAttribute('src', '/rmit-logo-red.png')
    })

    it('shows the HAPI name and tagline', () => {
        render(<Footer />)

        expect(screen.getByText(/RMIT HAPI/)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /hub for apple innovation/i })).toBeInTheDocument()
    })

    it('describes what HAPI does', () => {
        render(<Footer />)

        expect(screen.getByText(/empowers them to make impactful contributions/i)).toBeInTheDocument()
    })
})