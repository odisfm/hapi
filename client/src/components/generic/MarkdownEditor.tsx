import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    toolbarPlugin,
    CreateLink,
    linkDialogPlugin,
    linkPlugin,
    ListsToggle,
    diffSourcePlugin,
    DiffSourceToggleWrapper, BlockTypeSelect
} from '@mdxeditor/editor'

import '@mdxeditor/editor/style.css'
import {useCallback, useEffect, useRef} from "react";

export function MarkdownEditor({initText, setHasChanged, markdownRef, setDescription, contentStyles, containerStyles}: {
    initText: string,
    setHasChanged: (value: boolean) => void,
    markdownRef: React.RefObject<string>;
    setDescription: (value: string) => void,
    containerStyles?: string,
    contentStyles?: string,
}) {
    const hasMounted = useRef(false)

    const onChange = useCallback((newMarkdown: string) => {
        markdownRef.current = newMarkdown
        if (!hasMounted.current) {
            hasMounted.current = true
            return
        }

        setHasChanged(true)
        setDescription(newMarkdown)
    }, [markdownRef, setHasChanged, setDescription])

    useEffect(() => {
        markdownRef.current = initText
    }, [initText, markdownRef])

    return (
        <div className={`self-center ${containerStyles}`}>
            <MDXEditor markdown={initText || ""}
                       contentEditableClassName={`min-h-120 bg-white font-copy font-regular ${contentStyles}`}
                       onChange={onChange}
                       plugins={[
                           headingsPlugin({
                               allowedHeadingLevels: [1, 2, 3]
                           }),
                           listsPlugin(),
                           quotePlugin(),
                           thematicBreakPlugin(),
                           linkPlugin(),
                           linkDialogPlugin(),
                           diffSourcePlugin(),
                           toolbarPlugin({
                               toolbarClassName: 'my-classname text-xs max-w-screen',
                               toolbarContents: () => (
                                   <>
                                       <DiffSourceToggleWrapper>
                                           <UndoRedo/>
                                           <BlockTypeSelect />
                                           <BoldItalicUnderlineToggles/>
                                           <CreateLink />
                                           <ListsToggle />
                                       </DiffSourceToggleWrapper>
                                   </>
                               )
                           })
                       ]}
            />
        </div>
    );
}