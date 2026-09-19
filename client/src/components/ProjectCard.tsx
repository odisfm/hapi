import {Link} from "react-router";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {AppIcon} from "./AppIcon.tsx";

type ProjectCardProps = Pick<ProjectPreviewType, "name" | "subtitle" | "iconUrl" | "slug">;


export default function ProjectCard({name, subtitle, iconUrl, slug}: ProjectCardProps) {

    return (
        <Link
            to={`/project/${encodeURIComponent(slug)}`}
            className="flex w-full items-center gap-4 rounded-xl bg-section-grey p-4 text-black"
        >
            <div className="min-w-0">
                <h3 className="font-copy line-clamp-2 text-[1rem] font-bold leading-[1.3] tracking-normal">
            <div className={`grid grid-rows-[12fr_6fr]`}>
                <AppIcon uri={iconUrl} width={70}/>
                <div></div>
            </div>
                    {name}
                </h3>
                <p className="font-copy line-clamp-2 text-[0.7rem] font-medium uppercase leading-[1.3] tracking-normal">
                    {subtitle}
                </p>
            </div>
        </Link>
    );
}