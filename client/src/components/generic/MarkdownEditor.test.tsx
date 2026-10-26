import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {MarkdownEditor} from './MarkdownEditor.tsx'

// MDXEditor doesn't run in jsdom; this stand-in renders the markdown in a textbox and reports edits through onChange
vi.mock('@mdxeditor/editor', () => {
    const plugin = () => ({})
    return {
        MDXEditor: ({markdown, contentEditableClassName, onChange}: {
            markdown: string
            contentEditableClassName: string
            onChange: (markdown: string) => void
        }) => (
            <textarea
                aria-label="Markdown editor"
                className={contentEditableClassName}
                defaultValue={markdown}
                onChange={(e) => onChange(e.target.value)}
            />
        ),
        headingsPlugin: plugin,
        listsPlugin: plugin,
        quotePlugin: plugin,
        thematicBreakPlugin: plugin,
        linkPlugin: plugin,
        linkDialogPlugin: plugin,
        diffSourcePlugin: plugin,
        toolbarPlugin: plugin,
        UndoRedo: () => null,
        BoldItalicUnderlineToggles: () => null,
        CreateLink: () => null,
        ListsToggle: () => null,
        DiffSourceToggleWrapper: () => null,
        BlockTypeSelect: () => null,
    }
})

vi.mock('@mdxeditor/editor/style.css', () => ({}))

const setHasChanged = vi.fn()
const setDescription = vi.fn()

function renderEditor(initText: string, markdownRef = {current: ''}, styles: {containerStyles?: string, contentStyles?: string} = {}) {
    render(
        <MarkdownEditor
            initText={initText}
            setHasChanged={setHasChanged}
            markdownRef={markdownRef}
            setDescription={setDescription}
            {...styles}
        />,
    )
    return markdownRef
}

describe('MarkdownEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows the initial text', () => {
        renderEditor('# Hello')

        expect(screen.getByRole('textbox', {name: 'Markdown editor'})).toHaveValue('# Hello')
    })

    it('starts empty when there is no initial text', () => {
        renderEditor(undefined as unknown as string)

        expect(screen.getByRole('textbox', {name: 'Markdown editor'})).toHaveValue('')
    })

    it('puts the initial text in the markdown ref', () => {
        const markdownRef = renderEditor('# Hello')

        expect(markdownRef.current).toBe('# Hello')
    })

    it('applies the given styles', () => {
        renderEditor('', undefined, {containerStyles: 'container-style', contentStyles: 'content-style'})

        const editor = screen.getByRole('textbox', {name: 'Markdown editor'})
        expect(editor).toHaveClass('content-style')
        expect(editor.parentElement).toHaveClass('container-style')
    })

    describe('editing', () => {
        it('treats the first change as the editor settling, not an edit', async () => {
            const user = userEvent.setup()
            const markdownRef = renderEditor('')

            await user.type(screen.getByRole('textbox', {name: 'Markdown editor'}), 'a')

            expect(markdownRef.current).toBe('a')
            expect(setHasChanged).not.toHaveBeenCalled()
            expect(setDescription).not.toHaveBeenCalled()
        })

        it('reports later changes and keeps the markdown ref up to date', async () => {
            const user = userEvent.setup()
            const markdownRef = renderEditor('')

            await user.type(screen.getByRole('textbox', {name: 'Markdown editor'}), 'ab')

            expect(markdownRef.current).toBe('ab')
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(setDescription).toHaveBeenCalledTimes(1)
            expect(setDescription).toHaveBeenCalledWith('ab')
        })
    })
})
