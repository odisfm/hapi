import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {CategoryType} from '@hapi/shared/types/apiResponses'
import {CategoryEditor} from './CategoryEditor.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

// One stable object, so the load effect doesn't re-run on every render
vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const fetchMock = vi.fn()

function makeCategory(n: number, projectCount = 0): CategoryType {
    return {id: `category-${n}`, name: `Category ${n}`, projectCount}
}

function jsonOk(body: unknown) {
    return {ok: true, statusText: 'OK', json: async () => body}
}

function failure(error: string) {
    return {ok: false, statusText: 'Bad Request', json: async () => ({error})}
}

type MockApiOptions = {
    categories?: CategoryType[]
    loadFails?: boolean
    writeFails?: boolean
}

function mockApi({categories = [makeCategory(1, 2), makeCategory(2)], loadFails = false, writeFails = false}: MockApiOptions = {}) {
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (method === 'GET') return loadFails ? failure('Could not load') : jsonOk({categories})
        return writeFails ? failure('Could not save') : jsonOk({})
    })
}

function requestsWithMethod(method: string) {
    return fetchMock.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === method)
}

function spinner() {
    // the spinner is a bare svg with no accessible role
    return document.querySelector('.animate-spin')
}

async function renderEditor(options: MockApiOptions = {}) {
    mockApi(options)
    render(<CategoryEditor/>)
    await waitFor(() => expect(spinner()).not.toBeInTheDocument())
    return userEvent.setup()
}

function categoryItem(name: string) {
    return screen.getByText(name).closest('li')!
}

describe('CategoryEditor', () => {
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
        it('shows a spinner while the categories load', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            render(<CategoryEditor/>)

            expect(screen.getByRole('heading', {name: 'Categories'})).toBeInTheDocument()
            expect(spinner()).toBeInTheDocument()
        })

        it('lists every category', async () => {
            await renderEditor()

            const items = screen.getAllByRole('listitem')
            expect(items).toHaveLength(2)
            expect(within(items[0]).getByText('Category 1')).toBeInTheDocument()
            expect(within(items[0]).getByText('2 projects')).toBeInTheDocument()
            expect(within(items[1]).getByText('Category 2')).toBeInTheDocument()
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringMatching(/\/category$/),
                expect.objectContaining({method: 'GET', credentials: 'include'}),
            )
        })

        it('shows the server error when the categories cannot be loaded', async () => {
            await renderEditor({loadFails: true})

            expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Could not load'})
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
        })
    })

    describe('adding', () => {
        it('creates the category, reloads the list and clears the input', async () => {
            const user = await renderEditor()
            mockApi({categories: [makeCategory(1, 2), makeCategory(2), makeCategory(3)]})

            // the new category input has no label
            await user.type(screen.getByRole('textbox'), 'Category 3')
            await user.click(screen.getByRole('button', {name: 'submit'}))

            expect(await screen.findByText('Category 3')).toBeInTheDocument()
            const [url, init] = requestsWithMethod('POST')[0]
            expect(url).toMatch(/\/category$/)
            expect(JSON.parse(init.body)).toEqual({name: 'Category 3'})
            expect(screen.getByRole('textbox')).toHaveValue('')
        })

        it('does nothing when the name is empty', async () => {
            const user = await renderEditor()

            await user.click(screen.getByRole('button', {name: 'submit'}))

            expect(requestsWithMethod('POST')).toHaveLength(0)
        })

        it('shows the server error and keeps the typed name when creation fails', async () => {
            const user = await renderEditor({writeFails: true})

            await user.type(screen.getByRole('textbox'), 'Category 1')
            await user.click(screen.getByRole('button', {name: 'submit'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Could not save'}))
            expect(screen.getByRole('textbox')).toHaveValue('Category 1')
            expect(requestsWithMethod('GET')).toHaveLength(1)
        })
    })

    describe('renaming', () => {
        it('sends the new name and reloads the list', async () => {
            const user = await renderEditor()
            const item = categoryItem('Category 2')
            await user.click(within(item).getByRole('button', {name: 'rename'}))

            await user.clear(within(item).getByRole('textbox'))
            await user.type(within(item).getByRole('textbox'), 'Renamed')
            await user.click(within(item).getByRole('button', {name: 'submit rename'}))

            await waitFor(() => expect(requestsWithMethod('GET')).toHaveLength(2))
            const [url, init] = requestsWithMethod('PATCH')[0]
            expect(url).toMatch(/\/category\/category-2$/)
            expect(JSON.parse(init.body)).toEqual({name: 'Renamed'})
        })

        it('shows the server error when the rename fails', async () => {
            const user = await renderEditor({writeFails: true})
            const item = categoryItem('Category 2')
            await user.click(within(item).getByRole('button', {name: 'rename'}))

            await user.type(within(item).getByRole('textbox'), '{Enter}')

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Could not save'}))
            expect(requestsWithMethod('GET')).toHaveLength(1)
        })
    })

    describe('deleting', () => {
        it('asks for confirmation naming the category', async () => {
            dispatchModal.mockResolvedValue('cancel')
            const user = await renderEditor()

            await user.click(within(categoryItem('Category 1')).getByRole('button', {name: 'delete category'}))

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Delete category?',
                body: expect.stringContaining('Delete category Category 1?'),
            }))
        })

        it('does nothing when the user cancels', async () => {
            dispatchModal.mockResolvedValue('cancel')
            const user = await renderEditor()

            await user.click(within(categoryItem('Category 1')).getByRole('button', {name: 'delete category'}))

            expect(requestsWithMethod('DELETE')).toHaveLength(0)
        })

        it('deletes the category and reloads the list when confirmed', async () => {
            dispatchModal.mockResolvedValue('confirm')
            const user = await renderEditor()
            mockApi({categories: [makeCategory(2)]})

            await user.click(within(categoryItem('Category 1')).getByRole('button', {name: 'delete category'}))

            await waitFor(() => expect(screen.queryByText('Category 1')).not.toBeInTheDocument())
            expect(requestsWithMethod('DELETE')[0][0]).toMatch(/\/category\/category-1$/)
        })

        it('shows the server error when the delete fails', async () => {
            dispatchModal.mockResolvedValueOnce('confirm').mockResolvedValue('ok')
            const user = await renderEditor({writeFails: true})

            await user.click(within(categoryItem('Category 1')).getByRole('button', {name: 'delete category'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Could not save'}))
            expect(screen.getByText('Category 1')).toBeInTheDocument()
        })
    })
})
