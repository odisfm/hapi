import type {ProjectVersionSummaryType} from "@hapi/shared/types/project";
import {StatusLabel} from "./StatusLabel.tsx";
import {useCallback, useMemo} from "react";
import {ActionButtons} from "./ActionButtons.tsx";
import {useNavigate} from "react-router";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import type {CreateProjectResponse} from "@hapi/shared/types/apiResponses";
import {FeedbackHistory} from "./FeedbackHistory.tsx";
import {FaClock} from "react-icons/fa";
import { formatDistance } from "date-fns";
import {throwErrorFromResponse} from "../../../utils/misc.ts";

export type Action = "edit" | "withdraw" | "delete" | "revise"

export function ProjectListItem({summary, refresh}: {summary: ProjectVersionSummaryType, refresh: () => void}) {
    const navigate = useNavigate();
    const modalContext = useModal()
    const allowedActions: Set<Action> = useMemo(() => {
        const actions: Set<Action> = new Set();
        const approved = summary.approvedVersion
        const alt = summary.alternateVersion
        switch (alt?.status) {
            case undefined:
                actions.add("revise")
                break;
            case "PENDING":
                actions.add("withdraw")
                break;
            case "REJECTED":
                actions.add("revise")
                break;
            case "NOT_SUBMITTED":
                actions.add("edit")
                if (approved) {
                    actions.add("delete")
                }
                break
        }

        return actions
    }, [summary])


    const editFn = useCallback(() => {
        if (summary.alternateVersion) {
            navigate(`/student/project/${summary.alternateVersion.id}`)
        }
    }, [navigate, summary])

    const withdrawFn = useCallback(async () => {
        const choice = await modalContext.dispatchModal({
            headline: "Withdraw revision",
            body: "Revision will be withdrawn from approval queue.\nYou may then choose to edit this revision further.",
            buttons: [
                {id: "cancel", text: "Cancel", variant: "default"},
                {id: "confirm", text: "Withdraw", variant: "danger"},
            ]
        })
        if (choice === "cancel") return

        try {
            const res = await fetch(`${API_URL}/project/version/${summary.alternateVersion!.id}/status`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify({status: "NOT_SUBMITTED"}),
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            refresh()
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }

    }, [summary, refresh, modalContext])

    const reviseFn = useCallback(async () => {
        let id: string
        if (summary.alternateVersion) {
            id = summary.alternateVersion.id
        } else {
            id = summary.approvedVersion!.id
        }
        try {
            const res = await fetch(`${API_URL}/project/version/${id}/new`, {
                method: "POST",
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            const json: CreateProjectResponse = await res.json()
            navigate(`/student/project/${json.versionId}`)

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [summary, modalContext, navigate])

    const deleteFn = useCallback(async () => {
        const choice = await modalContext.dispatchModal({
            headline: "Delete revision?",
            body: "Revision will be deleted immediately.",
            buttons: [
                {id: "cancel", text: "Cancel", variant: "default"},
                {id: "confirm", text: "Delete", variant: "danger"},
            ]
        })
        if (choice === "cancel") return
        try {
            const res = await fetch(`${API_URL}/project/version/${summary.alternateVersion?.id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            refresh()
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
        refresh()
    }, [summary, refresh, modalContext])

    return (
        <li className={`flex flex-col gap-2 p-2 rounded-md bg-neutral-200`}>
            <span className={`text-lg font-bold`}>{summary.name}</span>
            {
                summary.approvedVersion &&
                <>
                        <span>Approved version</span>
                        <StatusLabel status={"APPROVED"} />
                    { summary.approvedVersion.reviewedAt &&
                        <span className={`flex items-center gap-1`}>
                            <FaClock />
                            {formatDistance(summary.approvedVersion.reviewedAt, new Date(), {addSuffix: true})}
                        </span>
                    }
                    {
                        !summary.alternateVersion &&
                        <ActionButtons actions={allowedActions} editFn={editFn} deleteFn={deleteFn} withdrawFn={withdrawFn} reviseFn={reviseFn} />
                    }
                </>
            }
            {
                summary.alternateVersion &&
                <>
                        <span>
                            {summary.approvedVersion ? "Alternate version" : "Pending version"}
                        </span>
                        <StatusLabel status={summary.alternateVersion.status} />
                    { summary.alternateVersion.reviewedAt &&
                        <span className={`flex items-center gap-1`}>
                            <FaClock />
                            {formatDistance(summary.alternateVersion.reviewedAt, new Date(), {addSuffix: true})}
                        </span>
                    }
                    <ActionButtons actions={allowedActions} editFn={editFn} deleteFn={deleteFn} withdrawFn={withdrawFn} reviseFn={reviseFn} />
                </>
            }
            {
                summary.feedbackHistory.length > 0 &&
                <>
                    <FeedbackHistory history={summary.feedbackHistory} />
                </>
            }
        </li>
    )
}