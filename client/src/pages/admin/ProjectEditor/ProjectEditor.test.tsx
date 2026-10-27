import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {ProjectEditor} from './ProjectEditor.tsx'
import {AuthContext} from "../../../contexts/auth/AuthContext.tsx";

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
    useBlocker: () => ({state: 'unblocked'}),
}))

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

vi.mock('../../../components/generic/MarkdownEditor.tsx', () => ({
    MarkdownEditor: ({initText, setHasChanged, markdownRef}: {
        initText: string
        setHasChanged: (changed: boolean) => void
        markdownRef: {current: string}
    }) => (
        <textarea
            aria-label="Description editor"
            defaultValue={initText}
            onChange={(e) => {
                markdownRef.current = e.target.value
                setHasChanged(true)
            }}
        />
    ),
}))

vi.mock('./MediaEditor/MediaEditor.tsx', () => ({
    MediaEditor: () => <p>Screenshots editor</p>,
}))

vi.mock('./VideoEditor.tsx', () => ({
    VideoEditor: () => <p>Video editor</p>,
}))

vi.mock('./SlugEditor.tsx', () => ({
    SlugEditor: ({projectId}: {projectId: string}) => <p>Slugs for {projectId}</p>,
}))

vi.mock('./CategoryPicker.tsx', () => ({
    CategoryPicker: ({project}: {project: {categories: string[]}}) => (
        <p>Selected categories: {project.categories.join(', ')}</p>
    ),
}))

vi.mock('./TextItemEditor.tsx', () => ({
    TextItemEditor: ({items, setItems, placeholder}: {
        items: string[]
        setItems: (items: string[]) => void
        placeholder: string
    }) => (
        <div>
            <ul aria-label={placeholder}>
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
            <button type="button" onClick={() => setItems([...items, 'Added item'])}>
                Add to {placeholder}
            </button>
        </div>
    ),
}))

const projectId = '123e4567-e89b-42d3-a456-426614174000'
const showcaseId = '223e4567-e89b-42d3-a456-426614174001'
const categoryId = '323e4567-e89b-42d3-a456-426614174002'
const versionId = '423e4567-e89b-42d3-a456-426614174002'

function makeProject(overrides: Record<string, unknown> = {}) {
    return {
        id: projectId,
        name: 'Example project',
        subtitle: 'A project subtitle',
        iconUrl: 'example-icon',
        slug: 'example-project',
        order: '1',
        developers: ['Alice'],
        categories: ['Games'],
        links: ['https://example.com'],
        description: 'A description',
        media: [],
        showcaseId,
        published: true,
        featured: false,
        versionId,
        ...overrides,
    }
}

const categories = [
    {id: categoryId, name: 'Games'},
    {id: '423e4567-e89b-42d3-a456-426614174003', name: 'Health'},
]

const showcases = [
    {id: showcaseId, name: 'Spring Showcase', year: 2025, semester: 1, publishedDate: null},
    {id: '523e4567-e89b-42d3-a456-426614174004', name: 'Autumn Showcase', year: 2025, semester: 2, publishedDate: null},
]

const fetchMock = vi.fn()

function jsonOk(body: unknown) {
    return {ok: true, statusText: 'OK', json: async () => body}
}

function mockApi({project = makeProject(), loadFails = false, patchOk = true, deleteOk = true} = {}) {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (url.includes('/project/id/')) {
            return loadFails ? {ok: false, statusText: 'Not Found', json: async () => ({})} : jsonOk({project})
        }
        if (url.endsWith('/category')) return jsonOk({categories})
        if (url.includes('/showcase/all')) return jsonOk({showcases})
        if (method === 'PATCH') return {ok: patchOk, statusText: 'Bad Request', json: async () => ({})}
        if (method === 'DELETE') return {ok: deleteOk, statusText: 'Server Error', json: async () => ({})}
        throw new Error(`Unexpected fetch: ${method} ${url}`)
    })
}

function requestsWithMethod(method: string) {
    return fetchMock.mock.calls.filter(([, init]) => init?.method === method)
}

function renderEditorPage() {
    return render(
        <AuthContext.Provider value={{
            user: {email: "a", name: "a", needsPasswordReset: false, role: "ADMIN"},
            setUserDetails: () => {},
            logOut: () => {},
            authPending: false
        }}>
            <MemoryRouter initialEntries={[`/dashboard/project/${projectId}`]}>
                <Routes>
                    <Route path="/dashboard/project/:projectId" element={<ProjectEditor/>}/>
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

async function renderEditor(options: Parameters<typeof mockApi>[0] = {}) {
    mockApi(options)
    renderEditorPage()
    return screen.findByLabelText('Project name')
}

describe('ProjectEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        dispatchModal.mockResolvedValue('ok')
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('requests the project with the id from the URL', async () => {
            await renderEditor()

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/project/id/${projectId}`),
                expect.objectContaining({credentials: 'include'}),
            )
        })

        it('shows no form while the project is loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderEditorPage()

            expect(screen.queryByLabelText('Project name')).not.toBeInTheDocument()
        })

        it('shows no form when the project cannot be loaded', async () => {
            mockApi({loadFails: true})
            renderEditorPage()

            await waitFor(() => expect(console.error).toHaveBeenCalled())

            expect(screen.queryByLabelText('Project name')).not.toBeInTheDocument()
        })
    })

    describe('the loaded project', () => {
        it('fills in the name and subtitle', async () => {
            await renderEditor()

            expect(screen.getByLabelText('Project name')).toHaveValue('Example project')
            expect(screen.getByLabelText('Subtitle')).toHaveValue('A project subtitle')
        })

        it('previews the project as a card', async () => {
            await renderEditor()

            expect(screen.getByRole('heading', {name: 'Example project'})).toBeInTheDocument()
            expect(screen.getByText('A project subtitle')).toBeInTheDocument()
        })

        it('lists the developers and links', async () => {
            await renderEditor()

            expect(screen.getByRole('list', {name: 'John Smith'})).toHaveTextContent('Alice')
            expect(screen.getByRole('list', {name: 'https://github.com/rmit/cool-app'}))
                .toHaveTextContent('https://example.com')
        })

        it('shows the project\'s categories and slugs', async () => {
            await renderEditor()

            expect(screen.getByText('Selected categories: Games')).toBeInTheDocument()
            expect(screen.getByText(`Slugs for ${projectId}`)).toBeInTheDocument()
        })

        it('offers every showcase and selects the project\'s own', async () => {
            await renderEditor()

            const select = await screen.findByLabelText('Showcase')
            expect(screen.getByRole('option', {name: /Spring Showcase/})).toBeInTheDocument()
            expect(screen.getByRole('option', {name: /Autumn Showcase/})).toBeInTheDocument()
            await waitFor(() => expect(select).toHaveValue(showcaseId))
        })

        it('shows a published project as Published', async () => {
            await renderEditor({project: makeProject({published: true})})

            expect(screen.getByRole('radio', {name: 'Published'})).toBeChecked()
            expect(screen.getByRole('radio', {name: 'Unpublished'})).not.toBeChecked()
        })

        it('shows an unpublished project as Unpublished', async () => {
            await renderEditor({project: makeProject({published: false})})

            expect(screen.getByRole('radio', {name: 'Unpublished'})).toBeChecked()
            expect(screen.getByRole('radio', {name: 'Published'})).not.toBeChecked()
        })
    })

    describe('tracking changes', () => {
        it.each(['', 'A description\n', 'A description\r\n'])('starts with nothing to save for %j', async (description) => {
            await renderEditor({project: makeProject({description})})

            expect(screen.getByRole('button', {name: 'no changes'})).toBeDisabled()
        })

        it.each([
            ['editing the name', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.type(screen.getByLabelText('Project name'), '!')
            }],
            ['editing the subtitle', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.type(screen.getByLabelText('Subtitle'), '!')
            }],
            ['changing the status', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.click(screen.getByRole('radio', {name: 'Unpublished'}))
            }],
            ['adding a developer', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.click(screen.getByRole('button', {name: 'Add to John Smith'}))
            }],
            ['editing the description', async (user: ReturnType<typeof userEvent.setup>) => {
                await user.type(screen.getByLabelText('Description editor'), '!')
            }],
        ])('enables saving after %s', async (_label, change) => {
            const user = userEvent.setup()
            await renderEditor()

            await change(user)

            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
            expect(screen.queryByRole('button', {name: 'no changes'})).not.toBeInTheDocument()
        })

        it('updates the preview card as the name is typed', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.clear(screen.getByLabelText('Project name'))
            await user.type(screen.getByLabelText('Project name'), 'Renamed')

            expect(screen.getByRole('heading', {name: 'Renamed'})).toBeInTheDocument()
        })
    })

    describe('saving', () => {
        it('sends the edited project to the server and goes back to nothing to save', async () => {
            const user = userEvent.setup()
            await renderEditor()
            await waitFor(() => expect(screen.getByLabelText('Showcase')).toHaveValue(showcaseId))

            await user.type(screen.getByLabelText('Project name'), ' v2')
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            const [url, init] = requestsWithMethod('PATCH')[0]
            expect(url).toMatch(/\/project$/)
            expect(init.credentials).toBe('include')
            expect(JSON.parse(init.body).project).toEqual(
                expect.objectContaining({id: projectId, published: true, showcaseId}),
            )
            expect(JSON.parse(init.body).projectVersion).toEqual(
                expect.objectContaining({id: versionId, name: "Example project v2"}),
            )
            expect(await screen.findByRole('button', {name: 'no changes'})).toBeDisabled()
        })

        it('stays on "save" when the server rejects the update', async () => {
            const user = userEvent.setup()
            await renderEditor({patchOk: false})
            await waitFor(() => expect(screen.getByLabelText('Showcase')).toHaveValue(showcaseId))

            await user.type(screen.getByLabelText('Project name'), ' v2')
            await user.click(screen.getByRole('button', {name: 'save'}))

            await waitFor(() => expect(requestsWithMethod('PATCH')).toHaveLength(1))
            expect(screen.getByRole('button', {name: 'save'})).toBeEnabled()
        })
    })

    describe('detail tabs', () => {
        it('starts on the description', async () => {
            await renderEditor()

            expect(screen.getByLabelText('Description editor')).toHaveValue('A description')
            expect(screen.queryByText('Screenshots editor')).not.toBeInTheDocument()
            expect(screen.queryByText('Video editor')).not.toBeInTheDocument()
        })

        it('switches to the screenshots editor', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Enable screenshots view'}))

            expect(screen.getByText('Screenshots editor')).toBeInTheDocument()
            expect(screen.queryByLabelText('Description editor')).not.toBeInTheDocument()
        })

        it('switches to the video editor', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Enable video view'}))

            expect(screen.getByText('Video editor')).toBeInTheDocument()
            expect(screen.queryByLabelText('Description editor')).not.toBeInTheDocument()
        })

        it('says there is no hero art, and offers an upload, when there is none', async () => {
            const user = userEvent.setup()
            await renderEditor()

            await user.click(screen.getByRole('button', {name: 'Enable hero art view'}))

            expect(screen.getByText('No hero art for this project yet.')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Upload hero art'})).toBeInTheDocument()
        })

        it('offers to replace the hero art when there is some', async () => {
            const user = userEvent.setup()
            await renderEditor({project: makeProject({heroArtUrl: 'example-hero-art'})})

            await user.click(screen.getByRole('button', {name: 'Enable hero art view'}))

            expect(screen.queryByText('No hero art for this project yet.')).not.toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Replace hero art'})).toBeInTheDocument()
        })
    })

    describe('deleting', () => {
        it('asks for confirmation before deleting', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValue('cancel')
            await renderEditor()

            await user.click(screen.getByRole('button', {name: /delete project/i}))

            expect(dispatchModal).toHaveBeenCalledWith(
                expect.objectContaining({headline: 'Delete Example project?'}),
            )
        })

        it('does nothing when the user cancels', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValue('cancel')
            await renderEditor()

            await user.click(screen.getByRole('button', {name: /delete project/i}))

            expect(requestsWithMethod('DELETE')).toHaveLength(0)
            expect(navigate).not.toHaveBeenCalled()
        })

        it('deletes the project and returns to the dashboard when confirmed', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValue('confirm')
            await renderEditor()

            await user.click(screen.getByRole('button', {name: /delete project/i}))

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'))
            expect(requestsWithMethod('DELETE')).toHaveLength(1)
            expect(requestsWithMethod('DELETE')[0][0]).toContain(`/project/${projectId}`)
        })

        it('shows an error and stays when the delete fails', async () => {
            const user = userEvent.setup()
            dispatchModal.mockResolvedValueOnce('confirm').mockResolvedValue('ok')
            await renderEditor({deleteOk: false})

            await user.click(screen.getByRole('button', {name: /delete project/i}))

            await waitFor(() =>
                expect(dispatchModal).toHaveBeenCalledWith(
                    expect.objectContaining({headline: 'Failed to delete project'}),
                ),
            )
            expect(navigate).not.toHaveBeenCalled()
        })
    })
})