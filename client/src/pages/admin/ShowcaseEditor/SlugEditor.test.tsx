import {render, screen, waitFor, within} from '@testing-library/react'
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

const showcaseId = '123e4567-e89b-42d3-a456-426614174000'
const fetchMock = vi.fn()

function slugsResponse(slugs: string[]) {
    return {ok: true, json: async () => ({slugs: slugs.map((slug) => ({slug}))})}
}

function shownSlugs() {
    return screen.queryAllByRole('listitem').map((item) => item.textContent)
}

function deleteButtonFor(slug: string) {
    const item = screen.getAllByRole('listitem').find((li) => li.textContent === `/${slug}`)!
    return within(item).getByRole('button')
}

function addButton() {
    return screen.getAllByRole('button').at(-1)!
}

async function renderEditor(slugs: string[]) {
    fetchMock.mockResolvedValueOnce(slugsResponse(slugs))
    render(<SlugEditor showcaseId={showcaseId}/>)
    if (slugs.length) await screen.findAllByRole('listitem')
    else await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
}

describe('SlugEditor (showcase)', () => {
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
        it('requests the showcase slugs and lists them', async () => {
            await renderEditor(['newest', 'older'])

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(`/showcase/id/${showcaseId}/slug`),
                expect.objectContaining({credentials: 'include'}),
            )
            expect(shownSlugs()).toEqual(['/newest', '/older'])
        })

        it('lists nothing when loading fails', async () => {
            fetchMock.mockRejectedValueOnce(new TypeError('Network down'))
            render(<SlugEditor showcaseId={showcaseId}/>)

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
            await user.click(addButton())

            await waitFor(() => expect(shownSlugs()).toEqual(['/fresh', '/existing']))
            expect(fetchMock).toHaveBeenNthCalledWith(2,
                expect.stringContaining(`/showcase/id/${showcaseId}/slug`),
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
            await user.click(addButton())

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

            await user.click(addButton())

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

            await user.click(addButton())

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

            await user.click(deleteButtonFor('only'))

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: "Can't delete slug",
                body: expect.stringContaining('Showcase must have at least one slug'),
            }))
            expect(fetchMock).toHaveBeenCalledTimes(1)
        })

        it('does nothing when the deletion is cancelled', async () => {
            const user = userEvent.setup()
            await renderEditor(['first', 'second'])
            dispatchModal.mockResolvedValue('cancel')

            await user.click(deleteButtonFor('second'))

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

            await user.click(deleteButtonFor('second'))

            await waitFor(() => expect(shownSlugs()).toEqual(['/first']))
            expect(fetchMock).toHaveBeenNthCalledWith(2,
                expect.stringContaining(`/showcase/id/${showcaseId}/slug`),
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

            await user.click(deleteButtonFor('second'))

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

            await user.click(deleteButtonFor('second'))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({
                headline: 'Failed to delete slug',
            })))
        })
    })
})
