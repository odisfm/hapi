import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {SlugEditor} from './SlugEditor.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const projectId = '123e4567-e89b-42d3-a456-426614174000'
const fetchMock = vi.fn()
const setHasChanged = vi.fn()

function slugsResponse(slugs: string[]) {
    return {ok: true, json: async () => ({slugs: slugs.map((slug) => ({slug}))})}
}

function shownSlugs() {
    return screen.queryAllByRole('listitem').map((item) => item.textContent)
}

async function renderEditor(slugs: string[]) {
    fetchMock.mockResolvedValueOnce(slugsResponse(slugs))
    render(<SlugEditor projectId={projectId} setHasChanged={setHasChanged}/>)
    if (slugs.length) await screen.findAllByRole('listitem')
    else await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
}

describe('SlugEditor (project)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('requests the project slugs and lists them', async () => {
            await renderEditor(['newest', 'older'])

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/project/id/${projectId}/slug`),
                expect.objectContaining({credentials: 'include'}),
            )
            expect(shownSlugs()).toEqual(['/newest', '/older'])
            expect(setHasChanged).not.toHaveBeenCalled()
        })

        it('lists nothing when loading fails', async () => {
            fetchMock.mockRejectedValueOnce(new TypeError('Network down'))
            render(<SlugEditor projectId={projectId} setHasChanged={setHasChanged}/>)

            await waitFor(() => expect(console.error).toHaveBeenCalled())
            expect(shownSlugs()).toEqual([])
        })
    })

    describe('adding', () => {
        it('posts the new slug, reloads the list and clears the input', async () => {
            const user = userEvent.setup()
            await renderEditor(['existing'])
            fetchMock
                .mockResolvedValueOnce({ok: true})
                .mockResolvedValueOnce(slugsResponse(['fresh', 'existing']))

            await user.type(screen.getByLabelText('Add new slug'), 'fresh')
            await user.click(screen.getByRole('button', {name: 'Add slug'}))

            await waitFor(() => expect(shownSlugs()).toEqual(['/fresh', '/existing']))
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(fetchMock).toHaveBeenNthCalledWith(2,
                expect.stringContaining(`/project/id/${projectId}/slug`),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify({slug: 'fresh'}),
                }),
            )
            expect(screen.getByLabelText('Add new slug')).toHaveValue('')
        })

        it('shows the server error message when the slug is rejected', async () => {
            const user = userEvent.setup()
            await renderEditor(['existing'])
            fetchMock.mockResolvedValueOnce({ok: false, statusText: 'Conflict', json: async () => ({error: 'Slug taken'})})

            await user.type(screen.getByLabelText('Add new slug'), 'existing')
            await user.click(screen.getByRole('button', {name: 'Add slug'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Failed to create slug',
                body: 'Error: Slug taken',
            })))
            expect(screen.getByLabelText('Add new slug')).toHaveValue('existing')
        })

        it('falls back to the status text when the response has no error message', async () => {
            const user = userEvent.setup()
            await renderEditor(['existing'])
            fetchMock.mockResolvedValueOnce({ok: false, statusText: 'Conflict', json: async () => ({})})

            await user.click(screen.getByRole('button', {name: 'Add slug'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                body: 'Error: Conflict',
            })))
        })

        it('falls back to the status text when the response is not JSON', async () => {
            const user = userEvent.setup()
            await renderEditor(['existing'])
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Gateway',
                json: async () => { throw new SyntaxError('Unexpected token') },
            })

            await user.click(screen.getByRole('button', {name: 'Add slug'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                body: 'Error: Bad Gateway',
            })))
        })
    })

    describe('deleting', () => {
        it('refuses to delete the only slug', async () => {
            const user = userEvent.setup()
            await renderEditor(['only'])
            dispatchModal.mockResolvedValue('')

            await user.click(screen.getByRole('button', {name: 'Delete slug only'}))

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({headline: "Can't delete slug"}))
            expect(fetchMock).toHaveBeenCalledTimes(1)
        })

        it('does nothing when the deletion is cancelled', async () => {
            const user = userEvent.setup()
            await renderEditor(['first', 'second'])
            dispatchModal.mockResolvedValue('cancel')

            await user.click(screen.getByRole('button', {name: 'Delete slug second'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Delete slug?',
            })))
            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(shownSlugs()).toEqual(['/first', '/second'])
        })

        it('deletes the slug once confirmed and reloads the list', async () => {
            const user = userEvent.setup()
            await renderEditor(['first', 'second'])
            dispatchModal.mockResolvedValue('delete')
            fetchMock
                .mockResolvedValueOnce({ok: true})
                .mockResolvedValueOnce(slugsResponse(['first']))

            await user.click(screen.getByRole('button', {name: 'Delete slug second'}))

            await waitFor(() => expect(shownSlugs()).toEqual(['/first']))
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(fetchMock).toHaveBeenNthCalledWith(2,
                expect.stringContaining(`/project/id/${projectId}/slug`),
                expect.objectContaining({
                    method: 'DELETE',
                    credentials: 'include',
                    body: JSON.stringify({slug: 'second'}),
                }),
            )
        })

        it('shows an error and keeps the slug when the deletion is rejected', async () => {
            const user = userEvent.setup()
            await renderEditor(['first', 'second'])
            dispatchModal.mockResolvedValueOnce('delete').mockResolvedValue('')
            fetchMock.mockResolvedValueOnce({ok: false, statusText: 'Forbidden', json: async () => ({error: 'Nope'})})

            await user.click(screen.getByRole('button', {name: 'Delete slug second'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Failed to delete slug',
            })))
            expect(shownSlugs()).toEqual(['/first', '/second'])
        })

        it('shows an error when the deletion request fails', async () => {
            const user = userEvent.setup()
            await renderEditor(['first', 'second'])
            dispatchModal.mockResolvedValueOnce('delete').mockResolvedValue('')
            fetchMock.mockRejectedValueOnce(new TypeError('Network down'))

            await user.click(screen.getByRole('button', {name: 'Delete slug second'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Failed to delete slug',
            })))
        })
    })
})
