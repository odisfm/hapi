import {render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {AnalyticsPage} from './AnalyticsPage.tsx'

vi.mock('./TopProjects.tsx', () => ({
    TopProjects: () => <p>Top projects</p>,
}))

describe('AnalyticsPage', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('links to the Umami dashboard in a new tab when it is configured', () => {
        vi.stubEnv('VITE_UMAMI_DASHBOARD_URL', 'https://umami.example.com/share/abc')

        render(<AnalyticsPage/>)

        const link = screen.getByRole('link', {name: 'Analytics Dashboard'})
        expect(link).toHaveAttribute('href', 'https://umami.example.com/share/abc')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
        expect(screen.queryByText(/isn't configured/)).not.toBeInTheDocument()
    })

    it('says analytics isn\'t configured when there is no dashboard URL', () => {
        vi.stubEnv('VITE_UMAMI_DASHBOARD_URL', '')

        render(<AnalyticsPage/>)

        expect(screen.getByText("Umami analytics isn't configured for this environment.")).toBeInTheDocument()
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('shows the heading and the top projects', () => {
        render(<AnalyticsPage/>)

        expect(screen.getByRole('heading', {name: 'Analytics'})).toBeInTheDocument()
        expect(screen.getByText('Top projects')).toBeInTheDocument()
    })
})
