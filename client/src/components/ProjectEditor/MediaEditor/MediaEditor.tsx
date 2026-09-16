import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";
import {MediaGroup} from "./MediaGroup.tsx";
import type {DeviceType} from "@hapi/shared/prisma/enums.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import {sortByLexorank} from "@hapi/shared/utils/sortByLexoRank";
import {LexoRank} from "@dalet-oss/lexorank";
import {API_URL, deviceEnumFriendly} from "../../../consts.ts";
import type {ProjectType} from "@hapi/shared/types/project";
import type {CreateProjectMediaRequestType} from "@hapi/shared/types/apiRequests";
import type {CreateProjectMediaResponse} from "@hapi/shared/types/apiResponses";
import {useModal} from "../../../contexts/modal/useModal.ts";

type Props = {
    media: ProjectMediaType[]
    setMedia: (value: ProjectMediaType[]) => void
    setHasChanged: (value: boolean) => void
    project: ProjectType,
    submitProject: () => Promise<void>
}

type DeviceMediaList = {
    deviceType: DeviceType,
    media: ProjectMediaType[],
}[]

function buildDeviceMediaList(media: ProjectMediaType[]): {
    list: DeviceMediaList
    changed: boolean
    flatWithOrders: ProjectMediaType[]
} {
    const list: DeviceMediaList = []
    for (const m of media) {
        const listIdx = list.findIndex(i => i.deviceType === m.deviceType)
        if (listIdx === -1) {
            list.push({deviceType: m.deviceType, media: [m]})
        } else {
            list[listIdx].media.push(m)
        }
    }

    let changed = false

    for (const l of list) {
        l.media = [...l.media].sort((a, b) => sortByLexorank(a, b))

        let lastLexorank: LexoRank | null = null
        for (const m of l.media) {
            if (m.order) {
                lastLexorank = LexoRank.parse(m.order)
            }
        }

        l.media = l.media.map(m => {
            if (m.order) return m
            changed = true
            const rank: LexoRank = lastLexorank === null
                ? LexoRank.middle()
                : lastLexorank.genNext()
            lastLexorank = rank
            return {...m, order: rank["value"]}
        })
    }

    const flatWithOrders = list.flatMap(l => l.media)


    for (const [key] of Object.entries(deviceEnumFriendly)) {
        let deviceInList = false
        for (const l of list) {
            if (l.deviceType === key) {
                deviceInList = true
                break
            }
        }
        if (!deviceInList) {
            list.push({deviceType: key as DeviceType, media: []})
        }
    }
    return {list, changed, flatWithOrders}
}

export function MediaEditor({media, setMedia, setHasChanged, project, submitProject}: Props) {
    const uploadRef = useRef<HTMLInputElement | null>(null)
    const {list: deviceMediaList, changed, flatWithOrders} = useMemo(
        () => buildDeviceMediaList(media),
        [media]
    )
    const [deviceType, setDeviceType] = useState<DeviceType>(() => {
            for (const l of deviceMediaList) {
                if (l.media.length) {
                    return l.deviceType
                }
            }
            return "PHONE"
        }
    )
    const [activeMedia, setActiveMedia] = useState<null | ProjectMediaType>(() => {
        for (const l of deviceMediaList) {
            if (l.media.length) return l.media[0]
        }
        return null
    })

    const modalContext = useModal()

    useEffect(() => {
        if (changed) {
            setMedia(flatWithOrders)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media])

    function onReorder(deviceType: DeviceType, sourceIdx: number, targetIdx: number) {
        const group = deviceMediaList.find(l => l.deviceType === deviceType)
        if (!group) return
        if (sourceIdx === targetIdx) return

        const sourceMedia = group.media[sourceIdx]
        if (!sourceMedia) return

        const remaining = group.media.filter((_, i) => i !== sourceIdx)
        const insertAt = Math.min(targetIdx, remaining.length)

        const prevItem = remaining[insertAt - 1]
        const nextItem = remaining[insertAt]

        let newRank: string
        if (prevItem && nextItem) {
            newRank = LexoRank.parse(prevItem.order).between(LexoRank.parse(nextItem.order))["value"]
        } else if (nextItem) {
            newRank = LexoRank.parse(nextItem.order).genPrev()["value"]
        } else if (prevItem) {
            newRank = LexoRank.parse(prevItem.order).genNext()["value"]
        } else {
            newRank = LexoRank.middle()["value"]
        }

        const sourceIdxInFullList = media.indexOf(sourceMedia)
        if (sourceIdxInFullList === -1) return

        setMedia([
            ...media.toSpliced(sourceIdxInFullList, 1),
            {...sourceMedia, order: newRank}
        ])
        setHasChanged(true)
    }

    const activeMediaIsActiveType = activeMedia && activeMedia.deviceType === deviceType

    function openFilePicker() {
        if (!uploadRef.current) return
        uploadRef.current.click()
    }

    async function uploadScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return
        const file = e.target.files[0]!
        const formData = new FormData()
        formData.append('file', file)
        formData.append("data", JSON.stringify({
            projectId: project.id,
            deviceType: deviceType,

        } satisfies CreateProjectMediaRequestType))

        let res: Response
        try {
            res = await fetch(`${API_URL}/media/screenshot`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to upload image")
            }
            const json: CreateProjectMediaResponse = await res.json()
            const record = json.projectMedia

            setMedia([...media, {
                uri: record.mediaUrl,
                deviceType: record.deviceType,
                order: "",
                mediaType: "SCREENSHOT",
                id: record.id,

            }])
            await submitProject()

        } catch (e) {
            console.error(e) // todo
        }
    }

    async function deleteScreenshot() {
        if (!activeMedia) return
        const confirm = await modalContext.dispatchModal({
            headline: "Delete screenshot?",
            body: "Screenshot will be deleted immediately.\nThis is not reversible.",
            buttons: [
                {id: "cancel", text: "Cancel", variant: "default"},
                {id: "confirm", text: "Confirm", variant: "danger"},
            ]
        })
        if (confirm !== "confirm") {
            return
        }

        let res: Response
        try {
            res = await fetch(`${API_URL}/media/screenshot/${activeMedia.id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to delete")
            }

            const deleteIdx = media.indexOf(activeMedia!)
            setMedia([...media.toSpliced(deleteIdx, 1)])
            setActiveMedia(null)
            await submitProject()

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error deleting screenshot",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}],
            })
        }
    }

    return (
        <div className={`flex flex-col gap-2`}>
            <div className={`flex gap-2`}>
                <div className={`
                w-1/2 aspect-square rounded-md bg-neutral-300 p-2 overflow-hidden 
                flex items-center justify-center
                `}>
                    {activeMedia &&
                        <img
                            className={`w-full h-full object-contain block`}
                            src={`${import.meta.env.VITE_S3_MEDIA_BUCKET}${activeMedia.uri}.webp`}
                        />
                    }
                    {!activeMedia &&
                        <span className={`px-4 text-center`}>Select a screenshot to modify it</span>
                    }
                </div>
                <div className={`flex flex-col gap-1 flex-1 items-start`}>
                    {activeMedia &&
                        <>
                            <a
                                href={`${import.meta.env.VITE_S3_MEDIA_BUCKET}${activeMedia.uri}.webp`}
                                target="_blank"
                                className={`
                            px-4 py-1 rounded-md bg-r-blue-700 hover:bg-r-blue text-white cursor-pointer
                            `}>
                                View in new tab
                            </a>
                            <button
                                className={`
                        px-4 py-1 rounded-md 
                        ${activeMediaIsActiveType ? `bg-neutral-500` : `bg-r-blue-700 hover:bg-r-blue cursor-pointer`} 
                        text-white 
                        `}
                                onClick={() => {
                                    const activeIdx = media.indexOf(activeMedia)
                                    const newActiveMedia = {...activeMedia, deviceType: deviceType}
                                    setMedia([...media.toSpliced(activeIdx, 1), newActiveMedia])
                                    setActiveMedia(newActiveMedia)
                                    setHasChanged(true)
                                }}
                                disabled={activeMedia.deviceType === deviceType}
                            >
                                Assign to {deviceEnumFriendly[deviceType as DeviceType]}
                            </button>
                            <button
                                className={`
                                px-4 py-1 rounded-md 
                                bg-red-700 hover:bg-red-500 cursor-pointer 
                                text-white 
                                `}
                                onClick={deleteScreenshot}
                            >
                                Delete screenshot
                            </button>
                        </>
                    }

                    <div className={`mt-auto`}>
                        <button
                            onClick={openFilePicker}
                            className={`
                        px-4 py-1 rounded-md 
                        bg-r-yellow-500 hover:bg-r-yellow-400 cursor-pointer 
                        text-black
                        `}
                        >
                            Upload screenshot
                        </button>
                        <input type={"file"} accept="image/*" className={"hidden"} ref={uploadRef}
                               onChange={(e) => uploadScreenshot(e)}/>
                    </div>
                </div>
            </div>
            <legend>Device</legend>
            <select
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                className={`p-2 bg-neutral-200 rounded-md self-start`}
            >
                {Object.entries(deviceEnumFriendly).map(([key, value]) =>
                    <option
                        key={key}
                        value={key}
                    >
                        {value}
                    </option>
                )}
            </select>
            <div className={`flex flex-col gap-2`}>
                {deviceMediaList.map((l) => {
                    if (l.deviceType !== deviceType) return null
                    return (
                        <MediaGroup
                            key={l.deviceType}
                            media={l.media}
                            onReorder={onReorder}
                            deviceType={l.deviceType}
                            setActiveMedia={setActiveMedia}
                        />
                    )
                })}
            </div>
        </div>
    )
}
