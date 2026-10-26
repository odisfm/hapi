import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {AnalyticsProjectResponse} from '@hapi/shared/types/apiResponses'
import {TopProjects} from './TopProjects.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

// One stable object, so the load effect doesn't re-run on every render
vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

type Analytics = AnalyticsProjectResponse['analytics']

const DAY_MS = 24 * 60 * 60 * 1000

function makeEntry(n: number, views: number): Analytics[number] {
    return {
        project: {
            id: `project-${n}`,
            name: `Project ${n}`,
            subtitle: `Subtitle ${n}`,
            iconUrl: 'example-icon',
            order: String(n),
            slug: `project-${n}`,
            developers: [],
            featured: false,
            versionId: `version-${n}`,
        },
        views,
    }
}

function manyEntries(count: number) {
    return Array.from({length: count}, (_, i) => makeEntry(i + 1, 100 - i))
}

const fetchMock = vi.fn()

function mockApi(analytics: Analytics = [makeEntry(1, 30), makeEntry(2, 12)]) {
    fetchMock.mockResolvedValue({ok: true, statusText: 'OK', json: async () => ({analytics})})
}

function lastRequestRange() {
    const params = new URLSearchParams(fetchMock.mock.lastCall![0].split('?')[1])
    return {
        start: new Date(params.get('startDate')!),
        end: new Date(params.get('endDate')!),
    }
}

function bodyRows() {
    return screen.getAllByRole('row').slice(1)
}

function dateInputs() {
    // the date inputs have no labels
    return document.querySelectorAll<HTMLInputElement>('input[type="date"]')
}

async function renderTopProjects(analytics?: Analytics) {
    mockApi(analytics)
    render(<TopProjects/>)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    return userEvent.setup()
}

describe('TopProjects', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        dispatchModal.mockResolvedValue('ok')
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('the table', () => {
        it('ranks the viewed projects with their view counts', async () => {
            await renderTopProjects()

            expect(await screen.findByRole('table')).toBeInTheDocument()
            expect(bodyRows().map((row) => row.textContent)).toEqual(['1Project 130', '2Project 212'])
        })

        it('leaves out projects with no views', async () => {
            await renderTopProjects([makeEntry(1, 5), makeEntry(2, 0)])

            await screen.findByRole('table')
            expect(bodyRows()).toHaveLength(1)
            expect(screen.queryByText('Project 2')).not.toBeInTheDocument()
        })

        it('says nothing was viewed when there are no views', async () => {
            await renderTopProjects([makeEntry(1, 0)])

            expect(screen.getByText('No projects were viewed during this period.')).toBeInTheDocument()
            expect(screen.queryByRole('table')).not.toBeInTheDocument()
        })

        it('shows an error when the analytics cannot be loaded', async () => {
            fetchMock.mockResolvedValue({ok: false, statusText: 'Service Unavailable'})
            render(<TopProjects/>)

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Service Unavailable'}))
            expect(screen.getByText('No projects were viewed during this period.')).toBeInTheDocument()
        })
    })

    describe('pagination', () => {
        it('has no pages for ten or fewer projects', async () => {
            await renderTopProjects(manyEntries(10))

            await screen.findByRole('table')
            expect(bodyRows()).toHaveLength(10)
            expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
        })

        it('shows ten projects per page and continues the ranking on later pages', async () => {
            const user = await renderTopProjects(manyEntries(12))
            await screen.findByRole('table')

            expect(bodyRows()).toHaveLength(10)

            await user.click(within(screen.getByRole('navigation')).getByRole('button', {name: '2'}))

            expect(bodyRows().map((row) => row.textContent)).toEqual(['11Project 1190', '12Project 1289'])
        })

        it('goes back to the first page when the range changes', async () => {
            const user = await renderTopProjects(manyEntries(12))
            await screen.findByRole('table')
            await user.click(within(screen.getByRole('navigation')).getByRole('button', {name: '2'}))

            await user.selectOptions(screen.getByRole('combobox'), 'month')

            await waitFor(() => expect(bodyRows()[0]).toHaveTextContent(/^1Project 1/))
        })
    })

    describe('date range', () => {
        it('requests the last 7 days by default', async () => {
            await renderTopProjects()

            expect(screen.getByRole('combobox')).toHaveValue('week')
            const {start, end} = lastRequestRange()
            expect(end.getTime() - start.getTime()).toBe(7 * DAY_MS)
            expect(fetchMock.mock.lastCall![0]).toContain('/analytics/project?')
            expect(fetchMock.mock.lastCall![1]).toEqual({credentials: 'include'})
        })

        it.each([
            ['day', 1],
            ['month', 30],
        ])('requests the preset range "%s"', async (preset, days) => {
            const user = await renderTopProjects()

            await user.selectOptions(screen.getByRole('combobox'), preset)

            await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
            const {start, end} = lastRequestRange()
            expect(end.getTime() - start.getTime()).toBe(days * DAY_MS)
        })

        it('waits for both dates before requesting a custom range', async () => {
            const user = await renderTopProjects()
            await screen.findByRole('table')

            await user.selectOptions(screen.getByRole('combobox'), 'custom')

            expect(dateInputs()).toHaveLength(2)
            expect(screen.getByText('No projects were viewed during this period.')).toBeInTheDocument()
            expect(fetchMock).toHaveBeenCalledTimes(1)
        })

        it('requests whole days from the start of the first date to the end of the second', async () => {
            const user = await renderTopProjects()
            await user.selectOptions(screen.getByRole('combobox'), 'custom')

            await user.type(dateInputs()[0], '2025-03-01')
            await user.type(dateInputs()[1], '2025-03-31')

            await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
            const {start, end} = lastRequestRange()
            expect(start).toEqual(new Date(2025, 2, 1, 0, 0, 0, 0))
            expect(end).toEqual(new Date(2025, 2, 31, 23, 59, 59, 999))
        })

        it('hides the date inputs for preset ranges', async () => {
            const user = await renderTopProjects()
            await user.selectOptions(screen.getByRole('combobox'), 'custom')

            await user.selectOptions(screen.getByRole('combobox'), 'day')

            expect(dateInputs()).toHaveLength(0)
        })
    })
})
