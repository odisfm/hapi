import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router'
import {LexoRank} from '@dalet-oss/lexorank'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {FeaturedProjectsEditor} from './FeaturedProjectsEditor.tsx'

const {dispatchModal, modalContext, listProps} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {
        dispatchModal,
        modalContext: {dispatchModal},
        listProps: {reorder: (() => {}) as (source: number, target: number) => void},
    }
})

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

vi.mock('./ProjectList.tsx', () => ({
    ProjectList: ({children, reorder}: {children: React.ReactNode; reorder: (s: number, t: number) => void}) => {
        listProps.reorder = reorder
        return <ul>{children}</ul>
    },
}))

vi.mock('./ProjectListItem.tsx', () => ({
    ProjectListItem: ({name, projectId, featured, index, toggleFeatured}: {
        name: string
        projectId: string
        featured: boolean
        index: number
        toggleFeatured: (id: string) => void
    }) => (
        <li>
            <span>{`${name}: ${featured ? 'featured' : 'not featured'} #${index}`}</span>
            <button type="button" onClick={() => toggleFeatured(projectId)}>
                Toggle {name}
            </button>
        </li>
    ),
}))

const fetchMock = vi.fn()

const first = LexoRank.middle()
const second = first.genNext()
const third = second.genNext()
const fourth = third.genNext()
const ranks = [first, second, third, fourth].map((rank) => rank.toString())

function makeProject(name: string, featured: boolean, order: string) {
    return {
        id: name.toLowerCase(),
        name,
        subtitle: `${name} subtitle`,
        iconUrl: 'example-icon',
        slug: name.toLowerCase(),
        developers: ['Alice'],
        featured,
        order,
    }
}

const defaultProjects = [
    makeProject('Alpha', true, ranks[0]),
    makeProject('Beta', true, ranks[1]),
    makeProject('Gamma', false, ranks[2]),
    makeProject('Delta', false, ranks[3]),
]

function jsonOk(body: unknown) {
    return {ok: true, statusText: 'OK', json: async () => body}
}

type MockApiOptions = {
    projects?: ReturnType<typeof makeProject>[]
    loadFails?: boolean
    patchOk?: boolean
}

function mockApi({projects = defaultProjects, loadFails = false, patchOk = true}: MockApiOptions = {}) {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (method === 'GET' && url.includes('/project/search')) {
            return loadFails
                ? {ok: false, statusText: 'Server Error', json: async () => ({})}
                : jsonOk({projects})
        }
        if (method === 'PATCH' && url.includes('/project/batch')) {
            return {ok: patchOk, statusText: 'Bad Request', json: async () => ({})}
        }
        throw new Error(`Unexpected fetch: ${method} ${url}`)
    })
}

function requestsWithMethod(method: string) {
    return fetchMock.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === method)
}

async function renderEditor(options: MockApiOptions = {}) {
    mockApi(options)
    render(
        <MemoryRouter>
            <FeaturedProjectsEditor/>
        </MemoryRouter>,
    )
    await screen.findByText('Alpha: featured #0')
}

function sentUpdates() {
    return JSON.parse(requestsWithMethod('PATCH')[0][1].body).projects
}

describe('FeaturedProjectsEditor', () => {
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

    describe('loading', () => {
        it('requests every published project', async () => {
            await renderEditor()

            expect(requestsWithMethod('GET')).toHaveLength(1)
            const url = requestsWithMethod('GET')[0][0]
            expect(url).toContain('/project/search')
            expect(url).toContain('published=published')
            expect(url).toContain('limit=100000')
        })

        it('shows no projects while loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            render(
                <MemoryRouter>
                    <FeaturedProjectsEditor/>
                </MemoryRouter>,
            )

            expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('tells the user when the projects cannot be loaded', async () => {
            mockApi({loadFails: true})
            render(
                <MemoryRouter>
                    <FeaturedProjectsEditor/>
                </MemoryRouter>,
            )

            await waitFor(() =>
                expect(dispatchModal).toHaveBeenCalledWith(
                    expect.objectContaining({headline: 'Failed to get featured projects'}),
                ),
            )
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
        })
    })

    describe('the loaded projects', () => {
        it('has headings for the featured and not featured sections', async () => {
            await renderEditor()

            expect(screen.getByRole('heading', {name: 'FEATURED PROJECTS'})).toBeInTheDocument()
            expect(screen.getByRole('heading', {name: 'FEATURED'})).toBeInTheDocument()
            expect(screen.getByRole('heading', {name: 'NOT FEATURED'})).toBeInTheDocument()
        })

        it('lists featured projects in order, then the rest', async () => {
            await renderEditor()

            expect(screen.getByText('Alpha: featured #0')).toBeInTheDocument()
            expect(screen.getByText('Beta: featured #1')).toBeInTheDocument()
            expect(screen.getByText('Gamma: not featured #0')).toBeInTheDocument()
            expect(screen.getByText('Delta: not featured #1')).toBeInTheDocument()
        })

        it('previews only the featured projects as cards', async () => {
            await renderEditor()

            expect(screen.getByRole('link', {name: /Alpha/})).toHaveAttribute('href', '/project/alpha')
            expect(screen.getByRole('link', {name: /Beta/})).toHaveAttribute('href', '/project/beta')
            expect(screen.queryByRole('link', {name: /Gamma/})).not.toBeInTheDocument()
            expect(screen.queryByRole('link', {name: /Delta/})).not.toBeInTheDocument()
        })

        it('orders featured projects by rank, not by the order they arrive', async () => {
            await renderEditor({
                projects: [
                    makeProject('Beta', true, ranks[1]),
                    makeProject('Alpha', true, ranks[0]),
                ],
            })

            expect(screen.getByText('Alpha: featured #0')).toBeInTheDocument()
            expect(screen.getByText('Beta: featured #1')).toBeInTheDocument()
        })

        it('starts with nothing to save', async () => {
            await renderEditor()

            expect(screen.getByRole('button', {name: 'no changes'})).toBeDisabled()
        })

        it('shows no projects when there are none', async () => {
            mockApi({projects: []})
            render(
                <MemoryRouter>
                    <FeaturedProjectsEditor/>
                </MemoryRouter>,
            )

            await waitFor(() => expect(requestsWithMethod('GET')).toHaveLength(1))

            expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })
    })

    describe('featuring and unfeaturing', () => {
        it('moves a project into the featured list and previews it', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))

            expect(screen.getByText(/^Gamma: featured/)).toBeInTheDocument()
            expect(screen.queryByText(/^Gamma: not featured/)).not.toBeInTheDocument()
            expect(screen.getByRole('link', {name: /Gamma/})).toBeInTheDocument()
        })

        it('moves a project out of the featured list and its preview', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Toggle Alpha'}))

            expect(screen.getByText(/^Alpha: not featured/)).toBeInTheDocument()
            expect(screen.queryByText(/^Alpha: featured/)).not.toBeInTheDocument()
            expect(screen.queryByRole('link', {name: /Alpha/})).not.toBeInTheDocument()
        })

        it('enables saving', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))

            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
            expect(screen.queryByRole('button', {name: 'no changes'})).not.toBeInTheDocument()
        })

        it('sends only the projects that were changed when saving', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))
            await user.click(screen.getByRole('button', {name: 'Toggle Alpha'}))
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            const [url, init] = requestsWithMethod('PATCH')[0]
            expect(url).toContain('/project/batch')
            expect(init.credentials).toBe('include')
            expect(sentUpdates()).toHaveLength(2)
            expect(sentUpdates()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({id: 'gamma', featured: true}),
                    expect.objectContaining({id: 'alpha', featured: false}),
                ]),
            )
        })

        it('sends a project once even if it is toggled twice', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))
            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            expect(sentUpdates()).toEqual([expect.objectContaining({id: 'gamma', featured: false})])
        })
    })

    describe('reordering', () => {
        it('moves a dragged project to the drop position and shows the new order', async () => {
            await renderEditor()

            act(() => listProps.reorder(0, 1))

            expect(await screen.findByText('Beta: featured #0')).toBeInTheDocument()
            expect(screen.getByText('Alpha: featured #1')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
        })

        it('saves only the project that moved, with a new rank after the one it was dropped on', async () => {
            const user = userEvent.setup()
            await renderEditor()

            act(() => listProps.reorder(0, 1))
            await user.click(await screen.findByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            const updates = sentUpdates()
            expect(updates).toHaveLength(1)
            expect(updates[0]).toEqual(expect.objectContaining({id: 'alpha', featured: true}))
            expect(updates[0].order).not.toBe(ranks[0])
            expect(updates[0].order > ranks[1]).toBe(true)
        })

        it('does nothing when a project is dropped where it already is', async () => {
            await renderEditor()

            act(() => listProps.reorder(1, 1))

            expect(screen.getByText('Alpha: featured #0')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'no changes'})).toBeDisabled()
        })

        it('does nothing when dropped on a position that does not exist', async () => {
            await renderEditor()

            act(() => listProps.reorder(0, 5))

            expect(screen.getByText('Alpha: featured #0')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'no changes'})).toBeDisabled()
        })
    })

    describe('saving', () => {
        it('reloads the projects and goes back to nothing to save', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))
            await user.click(screen.getByRole('button', {name: 'save'}))

            expect(await screen.findByRole('button', {name: 'no changes'})).toBeDisabled()
            expect(requestsWithMethod('GET')).toHaveLength(2)
        })

        it('tells the user and keeps the changes when the server rejects the save', async () => {
            const user = userEvent.setup()
            await renderEditor({patchOk: false})

            await user.click(screen.getByRole('button', {name: 'Toggle Gamma'}))
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() =>
                expect(dispatchModal).toHaveBeenCalledWith(
                    expect.objectContaining({headline: 'Failed to save changes'}),
                ),
            )
            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
            expect(requestsWithMethod('GET')).toHaveLength(1)
        })
    })
})