import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { Footer } from './Footer.tsx'

const showcases = [
    {
        id: 'showcase-0',
        name: 'Empty Showcase',
        year: 2026,
        semester: 1,
        publishedDate: null,
        slugs: [],
        _count: { projects: 0 },
    },
    {
        id: 'showcase-1',
        name: 'Spring Showcase',
        year: 2025,
        semester: 1,
        publishedDate: null,
        slugs: [{ slug: 'spring-showcase' }],
        _count: { projects: 1 },
    },
    {
        id: 'showcase-2',
        name: 'Autumn Showcase',
        year: 2025,
        semester: 2,
        publishedDate: null,
        slugs: [],
        _count: { projects: 2 },
    },
    {
        id: 'showcase-3',
        name: 'Winter Showcase',
        year: 2024,
        semester: 2,
        publishedDate: null,
        slugs: [{ slug: 'winter-showcase' }],
        _count: { projects: 1 },
    },
    {
        id: 'showcase-4',
        name: 'Summer Showcase',
        year: 2024,
        semester: 1,
        publishedDate: null,
        slugs: [],
        _count: { projects: 3 },
    },
    {
        id: 'showcase-5',
        name: 'Old Showcase',
        year: 2023,
        semester: 2,
        publishedDate: null,
        slugs: [],
        _count: { projects: 1 },
    },
]

function renderFooter() {
    return render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>,
    )
}

async function settle() {
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await act(async () => {})
}

describe('Footer', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({showcases: []}),
        }))
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

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

    it('lists the four newest showcases that have projects, linking by slug or id', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({showcases}),
        } as Response)

        renderFooter()

        expect(await screen.findByRole('link', {name: 'Showcases'})).toHaveAttribute('href', '/showcase')

        const links = screen.getAllByRole('link', {name: /showcase/i})
        expect(links).toHaveLength(5)
        expect(links.slice(1).map((link) => link.getAttribute('href'))).toEqual([
            '/showcase/showcase-2',
            '/showcase/spring-showcase',
            '/showcase/winter-showcase',
            '/showcase/showcase-4',
        ])
    })

    it('hides the showcases section when fetching fails', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('network failure'))

        renderFooter()
        await settle()

        expect(screen.queryByRole('link', {name: 'Showcases'})).not.toBeInTheDocument()
    })
})