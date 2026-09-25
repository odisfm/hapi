import type {ProjectGetSlugsResponse, ProjectSlugType} from "@hapi/shared/types/apiResponses";
import {useCallback, useEffect, useRef, useState} from "react";
import {API_URL} from "../../consts.ts";
import {TiDelete} from "react-icons/ti";
import {useModal} from "../../contexts/modal/useModal.ts";
import type {AlterProjectSlugRequestType} from "@hapi/shared/types/apiRequests";
import {IoMdAddCircle} from "react-icons/io";

type Props = {
    projectId: string
}

const liStyles = `bg-neutral-200 pl-4 pr-2 py-1 flex rounded-lg w-min flex gap-4 items-center`

export function SlugEditor({projectId}: Props) {
    const [slugs, setSlugs] = useState<ProjectSlugType[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const modalContext = useModal()

    const getSlugs = useCallback(async () => {
        let res
        try {
            res = await fetch(`${API_URL}/project/id/${projectId}/slug`, {
                credentials: "include",
            })
            const json: ProjectGetSlugsResponse = await res.json()
            setSlugs(json.slugs)

        } catch (e) {
            console.error(e)
        }
    }, [projectId])

    useEffect(() => {
        (async () => {
            getSlugs()
        })()
    }, [projectId, getSlugs])

    async function deleteSlug(slug: string) {
        if (slugs.length === 1) {
            return await modalContext.dispatchModal({
                headline: "Can't delete slug",
                body: "Project must have at least one slug. Add a new one before deleting this one,",
                buttons: [{id: "", text: "Ok", variant: "default"}]
            })
        }
        const result = await modalContext.dispatchModal({
            headline: "Delete slug?",
            body: `The slug "${slug}" will be immediately disassociated from this project.\n
            Existing links to this project, including those posted externally, will immediately break.\n
            Consider adding an additional slug, which will automatically take precedence over all other slugs.`,
            buttons: [
                {id: "cancel", text: "Cancel", variant: "default"},
                {id: "delete", text: "Understood, delete slug", variant: "danger"}
            ]
        })
        if (result === "delete") {
            let res
            try {
                res = await fetch(`${API_URL}/project/id/${projectId}/slug`, {
                    method: "DELETE",
                    credentials: "include",
                    body: JSON.stringify({slug: slug} satisfies AlterProjectSlugRequestType),
                })
                if (!res.ok) {
                    try {
                        const json = await res.json()
                        throw new Error(json?.error || res.statusText)
                    } catch {
                        throw new Error(res.statusText)
                    }
                }
                await getSlugs()
            } catch (error) {
                console.error(error)
                await modalContext.dispatchModal({
                    headline: "Failed to delete slug",
                    body: res ? String(res) : "Unknown error",
                    buttons: [{id: "", text: "Ok", variant: "default"}]
                })
            }
        }
    }

    async function addSlug(slug: string) {
        let res
        try {
            res = await fetch(`${API_URL}/project/id/${projectId}/slug`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({slug: slug} satisfies AlterProjectSlugRequestType),
            })
            if (!res.ok) {
                let errorMessage = ""
                try {
                    const json = await res.json()
                    errorMessage = json?.error || res.statusText
                } catch {
                    throw new Error(res.statusText)
                }
                throw new Error(errorMessage)
            }
            await getSlugs()
            inputRef.current!.value = ""
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to create slug",
                body: String(e),
                buttons: [{id: "", text: "Ok", variant: "default"}]
            })
        }
    }


    return (
        <div className={`flex flex-col gap-2`}>
            <ul>
                {slugs.map((slug) => {
                    return (
                        <li key={slug.slug} className={`${liStyles} mb-2 first:bg-r-blue-500 first:text-white`}>
                            <span>{`/${slug.slug}`}</span>
                            <button
                                className={`p-1 rounded-md hover:bg-red-600 hover:text-white cursor-pointer`}
                                onClick={() => {deleteSlug(slug.slug)}}
                            >
                                <TiDelete />
                            </button>
                        </li>
                    )
                })}
            </ul>
            <label htmlFor={"newSlugInput"} className={`text-sm`}>Add new slug</label>
            <div className={`flex gap-2 items-center`}>
                <input
                    id={"newSlugInput"} name={"newSlugInput"}
                    className={`${liStyles}`}
                    ref={inputRef}
                />
                <button
                    type="button"
                    className={`p-1 rounded-md bg-r-blue-700 hover:bg-r-blue text-white cursor-pointer`}
                    onClick={() => {
                        if (!inputRef.current) return
                        addSlug(inputRef.current.value)
                    }}
                >
                    <IoMdAddCircle />
                </button>
            </div>
        </div>
    )
}