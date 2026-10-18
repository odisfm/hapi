import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {LexoRank} from '@dalet-oss/lexorank'
import type {ProjectMediaType} from '@hapi/shared/types/projectMedia'
import type {ProjectType} from '@hapi/shared/types/project'
import {MediaEditor} from './MediaEditor.tsx'

const {dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('../../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const setMedia = vi.fn()
const setHasChanged = vi.fn()
const fetchSpy = vi.fn()

const firstRank = LexoRank.middle()

function makeScreenshot(id: string, rank: LexoRank): ProjectMediaType {
    return {id, uri: `${id}-uri`, mediaType: 'SCREENSHOT', deviceType: 'PHONE', order: rank['value'], status: 'AVAILABLE'}
}

const screenshots = [
    makeScreenshot('shot-1', firstRank),
    makeScreenshot('shot-2', firstRank.genNext()),
]

function renderEditor() {
    return render(
        <MediaEditor
            media={screenshots}
            setMedia={setMedia}
            setHasChanged={setHasChanged}
            project={{id: 'project-1'} as ProjectType}
        />,
    )
}

describe('MediaEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('fetch', fetchSpy)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('removing a screenshot', () => {
        it('removes the selected screenshot and marks the project changed, without saving', async () => {
            dispatchModal.mockResolvedValue('confirm')
            const user = userEvent.setup()
            renderEditor()

            await user.click(screen.getByAltText('Screenshot 2'))
            await user.click(screen.getByRole('button', {name: /remove screenshot/i}))

            expect(setMedia).toHaveBeenCalledWith([screenshots[0]])
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(fetchSpy).not.toHaveBeenCalled()
        })

        it('does nothing when cancelled', async () => {
            dispatchModal.mockResolvedValue('cancel')
            const user = userEvent.setup()
            renderEditor()

            await user.click(screen.getByRole('button', {name: /remove screenshot/i}))

            expect(setMedia).not.toHaveBeenCalled()
            expect(setHasChanged).not.toHaveBeenCalled()
        })
    })
})
