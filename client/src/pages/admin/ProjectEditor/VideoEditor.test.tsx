import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ProjectMediaType} from '@hapi/shared/types/projectMedia'
import type {ProjectAdminType} from '@hapi/shared/types/project'
import {VideoEditor} from './VideoEditor.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const setProject = vi.fn()
const setHasChanged = vi.fn()
const fetchSpy = vi.fn()

function makeMedia(id: string, overrides: Partial<ProjectMediaType> = {}): ProjectMediaType {
    // `id` and `uri` deliberately differ, as they do for real media
    return {id, uri: `${id}-uri`, mediaType: 'VIDEO', deviceType: 'PHONE', order: '', status: 'AVAILABLE', ...overrides}
}

const video = makeMedia('video-1')
const failedVideo = makeMedia('video-2', {status: 'FAILED'})
const screenshot = makeMedia('shot-1', {mediaType: 'SCREENSHOT'})

function renderEditor(videos: ProjectMediaType[], projectMedia: ProjectMediaType[]) {
    return render(
        <VideoEditor
            media={videos}
            project={{id: 'project-1', media: projectMedia} as unknown as ProjectAdminType}
            setProject={setProject}
            setHasChanged={setHasChanged}
        />,
    )
}

describe('VideoEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('fetch', fetchSpy)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('removing a video', () => {
        it('removes only that video and marks the project changed, without saving', async () => {
            dispatchModal.mockResolvedValue('confirm')
            const user = userEvent.setup()
            // The screenshot is last, so removing the wrong index would remove it instead
            renderEditor([video], [video, screenshot])

            await user.click(screen.getByRole('button', {name: /remove video/i}))

            expect(setProject).toHaveBeenCalledWith(expect.objectContaining({media: [screenshot]}))
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(fetchSpy).not.toHaveBeenCalled()
        })

        it('does nothing when cancelled', async () => {
            dispatchModal.mockResolvedValue('cancel')
            const user = userEvent.setup()
            renderEditor([video], [video, screenshot])

            await user.click(screen.getByRole('button', {name: /remove video/i}))

            expect(setProject).not.toHaveBeenCalled()
            expect(setHasChanged).not.toHaveBeenCalled()
        })

        it("leaves the project alone if the video isn't in it", async () => {
            dispatchModal.mockResolvedValue('confirm')
            const user = userEvent.setup()
            renderEditor([video], [screenshot])

            await user.click(screen.getByRole('button', {name: /remove video/i}))

            expect(setProject).not.toHaveBeenCalled()
        })

        it('dismisses a failed upload without asking for confirmation', async () => {
            const user = userEvent.setup()
            renderEditor([failedVideo], [failedVideo, screenshot])

            await user.click(screen.getByRole('button', {name: /dismiss/i}))

            expect(dispatchModal).not.toHaveBeenCalled()
            expect(setProject).toHaveBeenCalledWith(expect.objectContaining({media: [screenshot]}))
            expect(setHasChanged).toHaveBeenCalledWith(true)
        })
    })

    describe('uploading a video', () => {
        const newVideo = {
            id: 'video-new', projectId: 'project-1', mediaUrl: 'video-new-uri', mediaType: 'VIDEO',
            status: 'PENDING', createdAt: new Date().toISOString(),
        }

        function upload(container: HTMLElement) {
            const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
            return userEvent.upload(input, new File(['video'], 'video.mp4', {type: 'video/mp4'}))
        }

        it('adds the pending video to the version in place of the current one, and marks the project changed', async () => {
            fetchSpy
                .mockResolvedValueOnce({ok: true, json: async () => ({presignedUrl: 'https://upload.example.com', projectMedia: newVideo})})
                .mockResolvedValueOnce({ok: true})
            const {container} = renderEditor([video], [video, screenshot])

            await upload(container)

            expect(fetchSpy).toHaveBeenLastCalledWith('https://upload.example.com', expect.objectContaining({method: 'PUT'}))
            expect(setProject).toHaveBeenCalledWith(expect.objectContaining({
                media: [
                    screenshot,
                    {id: 'video-new', uri: 'video-new-uri', mediaType: 'VIDEO', deviceType: 'PHONE', order: '', status: 'PENDING'},
                ],
            }))
            expect(setHasChanged).toHaveBeenCalledWith(true)
        })

        it('leaves the version alone if the upload fails', async () => {
            fetchSpy
                .mockResolvedValueOnce({ok: true, json: async () => ({presignedUrl: 'https://upload.example.com', projectMedia: newVideo})})
                .mockResolvedValueOnce({ok: false, statusText: 'Forbidden'})
            vi.spyOn(console, 'error').mockImplementation(() => {})
            const {container} = renderEditor([video], [video, screenshot])

            await upload(container)

            expect(dispatchModal).toHaveBeenCalledWith(expect.objectContaining({headline: 'Failed to upload video'}))
            expect(setProject).not.toHaveBeenCalled()
            expect(setHasChanged).not.toHaveBeenCalled()
        })
    })
})
