import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";
import {useCallback, useMemo, useRef, useState} from "react";
import {useModal} from "../../contexts/modal/useModal.ts";
import {API_URL} from "../../consts.ts";
import {LuReplace} from "react-icons/lu";
import {FaCloudUploadAlt, FaSpinner, FaTrash} from "react-icons/fa";
import type {ProjectAdminType} from "@hapi/shared/types/project";
import type {CreateProjectVideoResponse} from "@hapi/shared/types/apiResponses";
import {Button} from "../generic/Button.tsx";

type Props = {
    media: ProjectMediaType[]
    project: ProjectAdminType
}

export function VideoEditor({media, project}: Props) {
    const [videoUploading, setVideoUploading] = useState(false);
    const modalContext = useModal()
    const videoPickerRef = useRef<HTMLInputElement>(null);
    const {currentVideoUrl, pendingUrls, failedUrls} = useMemo(() => {
        let currentVideoUrl: string | null = null;
        const pendingUrls: string[] = []
        const failedUrls: string[] = []

        for (const video of media) {
            if (video.status === "AVAILABLE") {
                currentVideoUrl = video.uri
            } else if (video.status === "FAILED") {
                failedUrls.push(video.uri)
            } else if (video.status === "PENDING") {
                pendingUrls.push(video.uri)
            }
        }

        return {
            currentVideoUrl,
            pendingUrls,
            failedUrls
        }
    }, [media])

    const deleteVideo = useCallback(async (uri: string, confirm: boolean) => {
        if (confirm) {
            const confirmation = await modalContext.dispatchModal({
                headline: "Delete video",
                body: "Video will be deleted immediately and be unrecoverable",
                buttons: [{id: "cancel", text: "Cancel", variant: "default"}, {id: "confirm", text: "Delete", variant: "danger"}],
            })
            if (confirmation !== "confirm") return
        }
        let res: Response
        try {
            res = await fetch(`${API_URL}/media/video/${uri}`, {
                credentials: "include",
                method: "DELETE"
            })
            if (!res.ok) {
                throw new Error(res.statusText)
            }
            window.location.reload()
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to delete video",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }
    }, [modalContext])

    const uploadVideo = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        let res1: Response
        let uploadUrl: string | null = null
        try {
            res1 = await fetch(`${API_URL}/media/video`, {
                credentials: "include",
                method: "POST",
                body: JSON.stringify({
                    projectId: project.id
                })
            })
            if (!res1.ok) {
                throw new Error(res1.statusText)
            }
            const json: CreateProjectVideoResponse = await res1.json()
            uploadUrl = json.presignedUrl
        } catch (e) {
            console.error(e)
            return await modalContext.dispatchModal({
                headline: "Failed to get video upload URL",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }
        let res2: Response
        try {
            setVideoUploading(true)
            res2 = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type
                },
                body: file
            })
            if (!res2.ok) {
                throw new Error(res2.statusText)
            }
        } catch (e) {
            console.error(e)
            return await modalContext.dispatchModal({
                headline: "Failed to upload video",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        } finally {
            setVideoUploading(false)
            window.location.reload()
        }

    }, [modalContext, project.id])

    return (
        <div className={`flex flex-col gap-4`}>
            {pendingUrls.length > 0 &&
            <p className={`p-4 rounded-md bg-r-yellow-500 text-black`}>A video is processing. Refresh this page in a few minutes.</p>
            }
            {failedUrls.length > 0 &&
                <ul>
                    {failedUrls.map((url) => (
                        <li key={url} className={`flex items-center gap-2`}>
                            <span className={`bg-red-800 p-2 text-white rounded-md mb-2`}>Video upload failed! Check the video file is correct. id: {url}</span>
                            <button
                                className={`ml-auto px-2 py-1 rounded-md cursor-pointer bg-neutral-500`}
                                onClick={() => deleteVideo(url, false)}
                            >
                                Dismiss
                            </button>
                        </li>
                        ))
                    }
                </ul>
            }
            {currentVideoUrl &&
            <video controls src={`${import.meta.env.VITE_S3_MEDIA_BUCKET}${currentVideoUrl}.webm`} />
            }
            { !videoUploading ?
                <div className={`flex gap-2`}>
                {
                    pendingUrls.length === 0 && !videoUploading &&
                    <Button
                        onClick={() => {
                            if (!videoPickerRef.current) return
                            videoPickerRef.current.click()
                        }}
                    >
                        {!currentVideoUrl ?
                            <><FaCloudUploadAlt/><span>Upload video</span></>
                            : <><LuReplace/><span>Replace video</span></>
                        }
                    </Button>
                }
                {
                    currentVideoUrl &&
                    <Button
                        color={"danger"}
                        onClick={() => {
                            deleteVideo(currentVideoUrl, true)
                        }}
                    >
                        <FaTrash/><span>Delete video</span>
                    </Button>
                }
            </div>
                :
                <div className={`flex gap-2 items-center`}>
                    <FaSpinner className={`animate-spin`} />
                    <span>Video upload in progress, don't leave this page!</span>
                </div>
            }
            <input
                className={`hidden`}
                type={"file"}
                accept={"video/*"}
                onChange={(e) => {uploadVideo(e)}}
                ref={videoPickerRef}
            />
        </div>
    )
}