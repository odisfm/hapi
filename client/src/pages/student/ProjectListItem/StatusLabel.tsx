import type {SubmissionStatus} from "@hapi/shared/prisma/enums";

export function StatusLabel({status}: {status: SubmissionStatus}) {
    let statusStyles = ""
    switch (status) {
        case "APPROVED":
            statusStyles = "bg-lime-600 text-white"
            break
        case "REJECTED":
            statusStyles = "bg-red-700 text-white"
            break
        case "PENDING":
            statusStyles = "bg-r-blue text-white"
            break
        case "NOT_SUBMITTED":
        case "WITHDRAWN":
        case "SUPERSEDED":
        default:
            statusStyles = "bg-neutral-600 text-white"
            break
    }


    return (
        <div className={`px-2 py-1 rounded-md text-sm self-start ${statusStyles}`}>
            {status.replace("_", " ")}
        </div>
    )
}