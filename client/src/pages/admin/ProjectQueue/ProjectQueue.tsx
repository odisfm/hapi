import {type ProjectVersionSummaryType} from "@hapi/shared/types/project";
import {useCallback, useEffect, useState} from "react";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import type {ProjectVersionsSearchResponse} from "@hapi/shared/types/apiResponses";
import {ProjectListItem} from "./ProjectListItem.tsx";

export function ProjectQueue() {
    const modalContext = useModal();
    const [projectQueue, setProjectQueue] = useState<ProjectVersionSummaryType[]>([])

    const getQueue = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/project/versions`, {
                credentials: "include"
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            const json: ProjectVersionsSearchResponse = await res.json()
            setProjectQueue(json.versions)
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to get queue",
                body: String(e)
            })
        }
    }, [modalContext])

    useEffect(() => {
        (async () => {
            getQueue()
        })()
    }, [getQueue])

    return (
        <>
            <h3 className={`font-bold text-3xl uppercase mb-6`}>Project queue</h3>
            {projectQueue.length === 0 && (
                <span className={`font-bold`}>No projects awaiting review</span>
            )}
            <ul className={`flex flex-col gap-2`}>
                {projectQueue.map((item) => {
                        return (
                            <ProjectListItem key={item.projectId} summary={item} />
                        )
                    }
                )}
            </ul>
        </>
    )
}