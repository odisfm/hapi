import type {ShowcaseListResponseItem} from '@hapi/shared/types/apiResponses'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {describe, expect, it} from 'vitest'
import {ShowcaseItem} from './ShowcaseItem.tsx'
import type {ConsolidatedShowcaseType} from './types.ts'

function makeShowcase(id: string, slug?: string) {
    return {
        id,
        name: 'Expo',
        year: 2025,
        semester: 1,
        publishedDate: null,
        _count: {projects: 1},
        slugs: slug ? [{slug}] : [],
    } as unknown as ShowcaseListResponseItem
}

function renderItem(data: ConsolidatedShowcaseType) {
    return render(
        <MemoryRouter>
            <ShowcaseItem data={data}/>
        </MemoryRouter>,
    )
}

describe('ShowcaseItem', () => {
    it('shows the showcase name', () => {
        renderItem({name: 'Expo'})

        expect(screen.getByText('Expo')).toBeInTheDocument()
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    describe('standalone showcase', () => {
        it('links to the showcase by its slug', () => {
            renderItem({name: 'Expo', standaloneShowcase: makeShowcase('show-1', 'expo')})

            expect(screen.getByRole('link', {name: 'View'})).toHaveAttribute('href', '/showcase/expo')
        })

        it('falls back to the id when there is no slug', () => {
            renderItem({name: 'Expo', standaloneShowcase: makeShowcase('show-1')})

            expect(screen.getByRole('link', {name: 'View'})).toHaveAttribute('href', '/showcase/show-1')
        })
    })

    describe('year showcases', () => {
        it('links each whole-year showcase by its year', () => {
            renderItem({
                name: 'Expo',
                yearShowcases: [
                    {year: 2025, showcase: makeShowcase('show-2025', 'expo-2025')},
                    {year: 2024, showcase: makeShowcase('show-2024')},
                ],
            })

            expect(screen.getByRole('link', {name: '2025'})).toHaveAttribute('href', '/showcase/expo-2025')
            expect(screen.getByRole('link', {name: '2024'})).toHaveAttribute('href', '/showcase/show-2024')
        })

        it('lists semesters under the year when there is no whole-year showcase', () => {
            renderItem({
                name: 'Expo',
                yearShowcases: [{
                    year: 2025,
                    semesters: [
                        {semester: 1, showcase: makeShowcase('s1', 'expo-s1')},
                        {semester: 2, showcase: makeShowcase('s2')},
                    ],
                }],
            })

            expect(screen.getByText('2025')).not.toHaveAttribute('href')
            expect(screen.getByRole('link', {name: 'Semester 1'})).toHaveAttribute('href', '/showcase/expo-s1')
            expect(screen.getByRole('link', {name: 'Semester 2'})).toHaveAttribute('href', '/showcase/s2')
        })

        it('shows a year with no showcases as plain text', () => {
            renderItem({name: 'Expo', yearShowcases: [{year: 2025}]})

            expect(screen.getByText('2025')).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })
    })
})
