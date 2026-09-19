import {Link} from "react-router";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {AppIcon} from "./AppIcon.tsx";

type ProjectCardProps = Pick<ProjectPreviewType, "name" | "subtitle" | "iconUrl" | "slug">;


export default function ProjectCard({name, subtitle, iconUrl, slug}: ProjectCardProps) {

    return (
        <Link
            to={`/project/${encodeURIComponent(slug)}`}
            className="flex w-full items-center gap-4 rounded-2xl bg-section-grey px-4 pt-4 min-h-25 text-black"
        >
            <div className={`grid grid-rows-[12fr_6fr]`}>
                <AppIcon uri={iconUrl} width={70}/>
                <div></div>
            </div>
            <div className="min-w-0 h-full grid grid-rows-[1fr_1fr] gap-1">
                <h3 className="font-copy line-clamp-2 text-[1rem] font-normal leading-[1.2] tracking-normal mt-0.5">
                    {name}
                </h3>
                <p className="font-copy line-clamp-2 text-[0.7rem] font-medium uppercase leading-[1.3] tracking-normal">
                    {subtitle}
                </p>
            </div>
        </Link>
    );
}