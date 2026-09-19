import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {useMemo} from "react";
import {Link} from "react-router";
import {AppIcon} from "../AppIcon.tsx";

export function ProjectListItem({project}: {project: ProjectPreviewType}) {

    const developerText = useMemo(() => {
        let text = ""
        for (const d of project.developers) {
            text += `${d}, `
        }
        return text.slice(0, -2)
    }, [project.developers])

    return (
        <li className={`flex gap-4 items-center w-full p-2 rounded-md bg-white mb-2`}>
            <AppIcon uri={project.iconUrl} width={50} />
            <div className={`flex flex-col gap-0.5`}>
                <Link to={`project/${project.id}`} className={`hover:underline`}>{project.name}</Link>
                <span className={`font-light`}>
                    {developerText}
                </span>
            </div>
            <Link
                to={`project/${project.id}`}
                className={`
                ml-auto px-6 py-1 rounded-md 
                bg-r-blue-700 hover:bg-r-blue cursor-pointer text-white
                `}
            >
                Edit
            </Link>
        </li>
    )
}