import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {MarkdownEditor} from './MarkdownEditor.tsx'
import {useEffect} from 'react'
import {normalizeMarkdown} from "../../utils/NormalizeMarkdown.ts";

// MDXEditor doesn't run in jsdom; this stand-in renders the markdown in a textbox and reports edits through onChange
vi.mock('@mdxeditor/editor', () => {
    const plugin = () => ({})
    return {
        MDXEditor: ({markdown, contentEditableClassName, onChange}: {
            markdown: string
            contentEditableClassName: string
            onChange: (markdown: string, initialMarkdownNormalize: boolean) => void
        }) => <MarkdownEditorTestDouble markdown={markdown} contentEditableClassName={contentEditableClassName} onChange={onChange}/>,
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

function MarkdownEditorTestDouble({markdown, contentEditableClassName, onChange}: {
    markdown: string
    contentEditableClassName: string
    onChange: (markdown: string, initialMarkdownNormalize: boolean) => void
}) {
    useEffect(() => onChange(`${markdown.replace(/\r\n?/g, "\n")}\n`, true), [markdown, onChange])

    return (
        <textarea
            aria-label="Markdown editor"
            className={contentEditableClassName}
            defaultValue={markdown}
            onChange={(e) => onChange(e.target.value, false)}
        />
    )
}

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
        it('does not treat loaded content as an edit when the initial value changes', () => {
            const markdownRef = {current: ''}
            const editor = render(
                <MarkdownEditor
                    initText=""
                    setHasChanged={setHasChanged}
                    markdownRef={markdownRef}
                    setDescription={setDescription}
                />,
            )

            editor.rerender(
                <MarkdownEditor
                    initText={'loaded\r\ncontent'}
                    setHasChanged={setHasChanged}
                    markdownRef={markdownRef}
                    setDescription={setDescription}
                />,
            )

            expect(setHasChanged).not.toHaveBeenCalled()
            expect(setDescription).not.toHaveBeenCalled()
        })

        it('does not treat normalized mount content as an edit', () => {
            const markdownRef = renderEditor('saved\r\ntext\r\n')

            expect(normalizeMarkdown(markdownRef.current)).toBe('saved\ntext')
            expect(setHasChanged).not.toHaveBeenCalled()
            expect(setDescription).not.toHaveBeenCalled()
        })

        it('reports the first real change as an edit', async () => {
            const user = userEvent.setup()
            const markdownRef = renderEditor('')

            await user.type(screen.getByRole('textbox', {name: 'Markdown editor'}), 'a')

            expect(markdownRef.current).toBe('a')
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(setDescription).toHaveBeenCalledWith('a')
        })

        it('reports later changes and keeps the markdown ref up to date', async () => {
            const user = userEvent.setup()
            const markdownRef = renderEditor('')

            await user.type(screen.getByRole('textbox', {name: 'Markdown editor'}), 'ab')

            expect(markdownRef.current).toBe('ab')
            expect(setHasChanged).toHaveBeenCalledWith(true)
            expect(setDescription).toHaveBeenCalledTimes(2)
            expect(setDescription).toHaveBeenCalledWith('ab')
        })
    })
})
