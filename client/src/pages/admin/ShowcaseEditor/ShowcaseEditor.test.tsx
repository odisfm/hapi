import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ShowcaseEditor} from './ShowcaseEditor.tsx'

const {navigate, dispatchModal, modalContext, blockerState, proceed, reset} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {
        navigate: vi.fn(),
        dispatchModal,
        modalContext: {dispatchModal},
        blockerState: {value: 'unblocked' as 'unblocked' | 'blocked'},
        proceed: vi.fn(),
        reset: vi.fn(),
    }
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
    useBlocker: () => ({state: blockerState.value, proceed, reset}),
}))

// One stable object, so the page's load effect doesn't re-run on every render
vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

// The real editor needs MDXEditor; this stand-in calls the same props
vi.mock('../../../components/generic/MarkdownEditor.tsx', () => ({
    MarkdownEditor: ({initText, setHasChanged, setDescription}: {
        initText: string
        setHasChanged: (changed: boolean) => void
        setDescription: (value: string) => void
    }) => (
        <textarea
            aria-label="Description editor"
            defaultValue={initText}
            onChange={(e) => {
                setDescription(e.target.value)
                setHasChanged(true)
            }}
        />
    ),
}))

vi.mock('./SlugEditor.tsx', () => ({
    SlugEditor: ({showcaseId}: {showcaseId: string}) => <p>Slugs for {showcaseId}</p>,
}))

const showcaseId = '123e4567-e89b-42d3-a456-426614174000'

function makeProject(n: number) {
    return {
        id: `project-${n}`,
        name: `Project ${n}`,
        subtitle: `Subtitle ${n}`,
        iconUrl: 'example-icon',
        slug: `project-${n}`,
    }
}

function makeShowcase(overrides: Record<string, unknown> = {}) {
    return {
        id: showcaseId,
        name: 'Spring Showcase',
        year: 2025,
        semester: 1,
        description: 'A description',
        publishedDate: null,
        projects: [] as ReturnType<typeof makeProject>[],
        ...overrides,
    }
}

const fetchMock = vi.fn()

function jsonOk(body: unknown) {
    return {ok: true, statusText: 'OK', json: async () => body}
}

type MockApiOptions = {
    showcase?: ReturnType<typeof makeShowcase>
    loadFails?: boolean
    patchOk?: boolean
    deleteOk?: boolean
}

function mockApi({showcase = makeShowcase(), loadFails = false, patchOk = true, deleteOk = true}: MockApiOptions = {}) {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (method === 'GET' && url.includes('/showcase/id/')) {
            return loadFails ? {ok: false, statusText: 'Not Found', json: async () => ({})} : jsonOk({showcase})
        }
        if (method === 'POST' && url.endsWith('/showcase')) return jsonOk({showcase})
        if (method === 'PATCH') return {ok: patchOk, statusText: 'Bad Request', json: async () => ({})}
        if (method === 'DELETE') return {ok: deleteOk, statusText: 'Server Error', json: async () => ({})}
        throw new Error(`Unexpected fetch: ${method} ${url}`)
    })
}

function requestsWithMethod(method: string) {
    return fetchMock.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === method)
}

function renderEditorPage(id: string = showcaseId) {
    return render(
        <MemoryRouter initialEntries={[`/dashboard/showcase/${id}`]}>
            <Routes>
                <Route path="/dashboard/showcase/:showcaseId" element={<ShowcaseEditor/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

async function renderEditor(options: MockApiOptions = {}) {
    mockApi(options)
    renderEditorPage()
    return screen.findByLabelText('Showcase name')
}

describe('ShowcaseEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        dispatchModal.mockResolvedValue('ok')
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(window, 'open').mockImplementation(() => null)
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        blockerState.value = 'unblocked'
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('requests the showcase with the id from the URL', async () => {
            await renderEditor()

            expect(requestsWithMethod('GET')).toHaveLength(1)
            const [url, init] = requestsWithMethod('GET')[0]
            expect(url).toContain(`/showcase/id/${showcaseId}`)
            expect(init.credentials).toBe('include')
        })

        it('shows no showcase content while loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderEditorPage()

            expect(screen.queryByLabelText('Showcase name')).not.toBeInTheDocument()
            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })

        it('tells the user and returns to the showcase list when it cannot be loaded', async () => {
            mockApi({loadFails: true})
            renderEditorPage()

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard/showcases'))
            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Failed to get showcase'}),
            )
            expect(screen.queryByLabelText('Showcase name')).not.toBeInTheDocument()
        })

        it('creates a new showcase instead of loading one when the id is "new"', async () => {
            mockApi()
            renderEditorPage('new')

            await screen.findByLabelText('Showcase name')

            expect(requestsWithMethod('POST')).toHaveLength(1)
            expect(requestsWithMethod('GET')).toHaveLength(0)
        })
    })

    describe('the loaded showcase', () => {
        it('fills in the name, year and semester', async () => {
            await renderEditor()

            expect(screen.getByLabelText('Showcase name')).toHaveValue('Spring Showcase')
            expect(screen.getByLabelText('Year')).toHaveValue(2025)
            expect(screen.getByLabelText('Semester')).toHaveValue(1)
        })

        it('fills in the description and shows the slugs', async () => {
            await renderEditor()

            expect(screen.getByLabelText('Description editor')).toHaveValue('A description')
            expect(screen.getByText(`Slugs for ${showcaseId}`)).toBeInTheDocument()
        })

        it('shows the name, year and semester as a heading', async () => {
            await renderEditor()

            expect(screen.getByRole('heading', {name: 'Spring Showcase'})).toBeInTheDocument()
            expect(screen.getByText('2025')).toBeInTheDocument()
            expect(screen.getByText(', Semester 1')).toBeInTheDocument()
        })

        it('calls an unnamed showcase "Untitled showcase"', async () => {
            await renderEditor({showcase: makeShowcase({name: ''})})

            expect(screen.getByRole('heading', {name: 'Untitled showcase'})).toBeInTheDocument()
        })

        it('shows no year or semester when they are 0', async () => {
            await renderEditor({showcase: makeShowcase({year: 0, semester: 0})})

            expect(screen.queryByText('2025')).not.toBeInTheDocument()
            expect(screen.queryByText(/, Semester/)).not.toBeInTheDocument()
        })

        it('shows no semester when there is no year', async () => {
            await renderEditor({showcase: makeShowcase({year: 0, semester: 2})})

            expect(screen.queryByText(/, Semester/)).not.toBeInTheDocument()
        })
    })

    describe('publish date', () => {
        it('says the showcase is not public when there is no date', async () => {
            await renderEditor({showcase: makeShowcase({publishedDate: null})})

            expect(screen.getByLabelText('Publish date')).toHaveValue('')
            expect(screen.getByText(/no date set/i)).toBeInTheDocument()
        })

        it('shows the date and says it is public immediately when it is in the past', async () => {
            await renderEditor({showcase: makeShowcase({publishedDate: new Date(2020, 0, 15, 9, 30)})})

            expect(screen.getByLabelText('Publish date')).toHaveValue('2020-01-15T09:30')
            expect(screen.getByText(/public immediately/i)).toBeInTheDocument()
        })

        it('says how long until it is public when the date is in the future', async () => {
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            await renderEditor({showcase: makeShowcase({publishedDate: nextWeek})})

            expect(screen.getByText(/will be public in/i)).toBeInTheDocument()
            expect(screen.queryByText(/public immediately/i)).not.toBeInTheDocument()
        })
    })

    describe('tracking changes', () => {
        it.each(['', 'A description\n', 'A description\r\n'])('starts with nothing to save for %j', async (description) => {
            await renderEditor({showcase: makeShowcase({description})})

            expect(screen.getByRole('button', {name: 'no changes'})).toBeDisabled()
        })

        it('adds a beforeunload warning only after an edit and removes it on unmount', async () => {
            const user = userEvent.setup()
            mockApi()
            const {unmount} = renderEditorPage()
            await screen.findByLabelText('Showcase name')

            const unchangedEvent = new Event('beforeunload')
            const unchangedPreventDefault = vi.spyOn(unchangedEvent, 'preventDefault')
            window.dispatchEvent(unchangedEvent)
            expect(unchangedPreventDefault).not.toHaveBeenCalled()

            await user.type(screen.getByLabelText('Showcase name'), '!')
            const changedEvent = new Event('beforeunload')
            const changedPreventDefault = vi.spyOn(changedEvent, 'preventDefault')
            window.dispatchEvent(changedEvent)
            expect(changedPreventDefault).toHaveBeenCalled()

            unmount()
            const afterUnmountEvent = new Event('beforeunload')
            const afterUnmountPreventDefault = vi.spyOn(afterUnmountEvent, 'preventDefault')
            window.dispatchEvent(afterUnmountEvent)
            expect(afterUnmountPreventDefault).not.toHaveBeenCalled()
        })

        it('blocks in-app navigation and resets the blocker when leaving is cancelled', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.type(screen.getByLabelText('Showcase name'), '!')
            blockerState.value = 'blocked'
            await user.type(screen.getByLabelText('Showcase name'), '?')

            await waitFor(() => expect(window.confirm).toHaveBeenCalledWith('You have unsaved changes. Leave anyway?'))
            expect(reset).toHaveBeenCalled()
            expect(proceed).not.toHaveBeenCalled()
        })

        it.each([
            ['the name', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.type(screen.getByLabelText('Showcase name'), '!')
            }],
            ['the year', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.clear(screen.getByLabelText('Year'))
                await user.type(screen.getByLabelText('Year'), '2030')
            }],
            ['the semester', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.clear(screen.getByLabelText('Semester'))
                await user.type(screen.getByLabelText('Semester'), '2')
            }],
            ['the description', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.type(screen.getByLabelText('Description editor'), '!')
            }],
        ])('enables saving after editing %s', async (_label, change) => {
            const user = userEvent.setup()
            await renderEditor()

            await change(user)

            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
            expect(screen.queryByRole('button', {name: 'no changes'})).not.toBeInTheDocument()
        })

        it('updates the heading as the name is typed', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.clear(screen.getByLabelText('Showcase name'))
            await user.type(screen.getByLabelText('Showcase name'), 'Renamed')

            expect(screen.getByRole('heading', {name: 'Renamed'})).toBeInTheDocument()
        })

        it('updates the year in the heading as it is typed', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.clear(screen.getByLabelText('Year'))
            await user.type(screen.getByLabelText('Year'), '2030')

            expect(screen.getByText('2030')).toBeInTheDocument()
        })
    })

    describe('saving', () => {
        it('sends the edited showcase to the server and goes back to nothing to save', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.type(screen.getByLabelText('Showcase name'), ' v2')
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            const [url, init] = requestsWithMethod('PATCH')[0]
            expect(url).toMatch(/\/showcase$/)
            expect(init.credentials).toBe('include')
            expect(JSON.parse(init.body).showcase).toEqual(
                expect.objectContaining({id: showcaseId, name: 'Spring Showcase v2', year: 2025}),
            )
            expect(await screen.findByRole('button', {name: 'no changes'})).toBeDisabled()

            const event = new Event('beforeunload')
            const preventDefault = vi.spyOn(event, 'preventDefault')
            window.dispatchEvent(event)
            expect(preventDefault).not.toHaveBeenCalled()
        })

        it('sends the edited description', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.type(screen.getByLabelText('Description editor'), ' more')
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            expect(JSON.parse(requestsWithMethod('PATCH')[0][1].body).showcase.description)
                .toBe('A description more')
        })

        it('tells the user and stays on "save" when the server rejects the update', async () => {
            const user = userEvent.setup()
            await renderEditor({patchOk: false})

            await user.type(screen.getByLabelText('Showcase name'), ' v2')
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() =>
                expect(dispatchModal).toHaveBeenCalledWith(
                    expect.objectContaining({headline: 'Failed to update showcase'}),
                ),
            )
            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
        })
    })

    describe('projects', () => {
        it('says there are none yet when the showcase is empty', async () => {
            await renderEditor({showcase: makeShowcase({projects: []})})

            expect(screen.getByRole('heading', {name: 'PROJECTS'})).toBeInTheDocument()
            expect(screen.getByText('None yet')).toBeInTheDocument()
        })

        it('shows each project and no empty message', async () => {
            await renderEditor({showcase: makeShowcase({projects: [makeProject(1), makeProject(2)]})})

            expect(screen.getByRole('button', {name: /Project 1/})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /Project 2/})).toBeInTheDocument()
            expect(screen.queryByText('None yet')).not.toBeInTheDocument()
        })

        it('opens a project in the project editor when it is clicked', async () => {
            const user = userEvent.setup()
            await renderEditor({showcase: makeShowcase({projects: [makeProject(1), makeProject(2)]})})

            await user.click(screen.getByRole('button', {name: /Project 2/}))

            expect(window.open).toHaveBeenCalledTimes(1)
            expect(window.open).toHaveBeenCalledWith('/dashboard/project/project-2')
        })
    })

    describe('deleting', () => {
        it('refuses, and explains why, when the showcase still has projects', async () => {
            const user = userEvent.setup()
            await renderEditor({showcase: makeShowcase({projects: [makeProject(1)]})})

            await user.click(screen.getByRole('button', {name: /delete showcase/i}))

            expect(dispatchModal).toHaveBeenCalledTimes(1)
            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: "Can't delete showcase"}),
            )
            expect(requestsWithMethod('DELETE')).toHaveLength(0)
        })

        it('asks for confirmation before deleting an empty showcase', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValue('cancel')
            await renderEditor()

            await user.click(screen.getByRole('button', {name: /delete showcase/i}))

            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Delete showcase?'}),
            )
        })

        it('does nothing when the user cancels', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValue('cancel')
            await renderEditor()

            await user.click(screen.getByRole('button', {name: /delete showcase/i}))

            expect(requestsWithMethod('DELETE')).toHaveLength(0)
            expect(navigate).not.toHaveBeenCalled()
        })

        it('deletes the showcase and returns to the showcase list when confirmed', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValue('confirm')
            await renderEditor()

            await user.click(screen.getByRole('button', {name: /delete showcase/i}))

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard/showcases'))
            expect(requestsWithMethod('DELETE')).toHaveLength(1)
            expect(requestsWithMethod('DELETE')[0][0]).toContain(`/showcase/id/${showcaseId}`)
        })

        it('shows an error and stays when the delete fails', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValueOnce('confirm').mockResolvedValue('ok')
            await renderEditor({deleteOk: false})

            await user.click(screen.getByRole('button', {name: /delete showcase/i}))

            await waitFor(() =>
                expect(dispatchModal).toHaveBeenCalledWith(
                    expect.objectContaining({headline: 'Failed to delete showcase'}),
                ),
            )
            expect(navigate).not.toHaveBeenCalled()
        })
    })
})