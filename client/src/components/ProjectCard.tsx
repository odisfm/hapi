import {useState} from "react";
import {Link} from "react-router";
import type {ProjectPreviewType} from "@hapi/shared/types/project";

const ICON_BUCKET_URL = import.meta.env.VITE_S3_ICON_BUCKET;

type ProjectCardProps = Pick<ProjectPreviewType, "name" | "subtitle" | "iconUrl" | "slug">;

function resolveStorageUrl(bucketUrl: string, storageKey: string, extension = "") {
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
        return storageKey;
    }

    return `${bucketUrl}${storageKey}${extension}`;
}

export default function ProjectCard({name, subtitle, iconUrl, slug}: ProjectCardProps) {
    const [iconFailed, setIconFailed] = useState(!iconUrl);

    return (
        <Link
            to={`/project/${encodeURIComponent(slug)}`}
            className="flex w-full items-center gap-4 rounded-xl bg-section-grey p-4 text-black"
        >
            {iconFailed ? (
                <span className="h-12 w-12 shrink-0 rounded-lg bg-r-red" aria-hidden="true" />
            ) : (
                <img
                    src={resolveStorageUrl(ICON_BUCKET_URL, iconUrl, ".webp")}
                    alt={`${name} icon`}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    onError={() => setIconFailed(true)}
                />
            )}
            <div className="min-w-0">
                <h3 className="line-clamp-2 text-[1.125rem] font-bold leading-[1.3] tracking-normal">
                    {name}
                </h3>
                <p className="line-clamp-2 text-[0.875rem] uppercase leading-[1.3] tracking-normal">
                    {subtitle}
                </p>
            </div>
        </Link>
    );
}