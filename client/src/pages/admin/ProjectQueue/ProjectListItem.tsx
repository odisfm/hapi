import type {ProjectVersionSummaryType} from "@hapi/shared/types/project";
import {FeedbackHistory} from "../../student/ProjectListItem/FeedbackHistory.tsx";
import {Button} from "../../../components/generic/Button.tsx";
import {useNavigate} from "react-router";

export function ProjectListItem({summary}: {summary: ProjectVersionSummaryType}) {
    const navigate = useNavigate();
    return (
        <li
            className={`bg-neutral-200 rounded-md flex gap-2 p-4`}
        >
            <div className={`flex flex-col gap-4`}>
                <table
                    className={`[&_td:first-of-type]:font-bold [&_td:first-of-type]:pr-2 [&_td:first-of-type]:text-right`}
                >
                    <tbody>
                    <tr>
                        <td>
                            {summary.users.length === 1 ? "Student" : "Students"}
                        </td>
                        <td>
                            {String(summary.users.map((u) => u.name).join(", "))}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Project name
                        </td>
                        <td>
                            {summary.name}
                        </td>
                    </tr>
                    </tbody>
                </table>

                {summary.feedbackHistory.length > 0 && <FeedbackHistory history={summary.feedbackHistory}/>}
            </div>
            <Button
                styles={`ml-auto`}
                onClick={() => {
                    navigate(`/dashboard/project/${summary.alternateVersion!.id}`)
                }}
            >
                Review
            </Button>
        </li>
    )
}