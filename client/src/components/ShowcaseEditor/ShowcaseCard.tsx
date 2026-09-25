import {useNavigate} from "react-router";
import {formatDate} from "date-fns";
import {Button} from "../generic/Button.tsx";

type Props = {
    name: string,
    id: string,
    projectCount: number,
    publishedDate: Date | null
}

export function ShowcaseCard({name, id, projectCount, publishedDate}: Props) {
    const navigate = useNavigate();
    return (
        <div
            className={`flex p-4 rounded-md bg-neutral-200`}
        >
            <div className={`flex flex-col gap-1`}>
                <span className={`font-bold`}>{name}</span>
                <span className={`font-thin text-sm`}>id: {id}</span>
                <div className={`flex gap-1`}>
                    <span>Publish date: <span
                        className={`font-bold`}>{publishedDate ? formatDate(publishedDate, "dd/M/yyyy HH:mm") : "No date set"}</span></span>
                </div>
                <span className={`font-thin`}>{projectCount} {projectCount === 1 ? "project" : "projects"}</span>
            </div>

            <div className={`ml-auto`}>
                <Button
                    onClick={() => navigate(`/dashboard/showcase/${id}`)}
                    color={"blue"}
                >
                    Edit
                </Button>
            </div>
        </div>
    )
}