import {type ProjectVersionSummaryType} from "@hapi/shared/types/project";
import {useCallback, useEffect, useState} from "react";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import type {ProjectVersionsSearchResponse} from "@hapi/shared/types/apiResponses";
import {ProjectListItem} from "./ProjectListItem.tsx";
import {Spinner} from "../../../components/generic/Spinner.tsx";

export function ProjectQueue() {
    const modalContext = useModal();
    const [loading, setLoading] = useState(false);
    const [projectQueue, setProjectQueue] = useState<ProjectVersionSummaryType[]>([])

    const getQueue = useCallback(async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }, [modalContext])

    useEffect(() => {
        (async () => {
            getQueue()
        })()
    }, [getQueue])

    return (
        <div className={`flex flex-col gap-2`}>
            <div className={`flex items-center gap-2 w-full`}>
                <h3 className={`font-bold text-3xl uppercase`}>Project queue</h3>
                {loading && <Spinner /> }
            </div>
            {!loading && projectQueue.length === 0 && (
                <span className={`font-bold`}>No projects awaiting review</span>
            )}
            <ul className={`flex flex-col gap-2 mt-6`}>
                {projectQueue.map((item) => {
                        return (
                            <ProjectListItem key={item.projectId} summary={item} />
                        )
                    }
                )}
            </ul>
        </div>
    )
}