import {useEffect, useState} from "react";
import {useParams} from "react-router";
import type {ProjectDetailsResponse} from "@hapi/shared/types/apiResponses";
import {API_URL} from "../consts.ts";

const ICON_BUCKET_URL = import.meta.env.VITE_S3_ICON_BUCKET;
const MEDIA_BUCKET_URL = import.meta.env.VITE_S3_MEDIA_BUCKET;

function resolveStorageUrl(bucketUrl: string, storageKey: string, extension = "") {
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
        return storageKey;
    }

    return `${bucketUrl}${storageKey}${extension}`;
}

type ProjectPageState = {
    project: ProjectDetailsResponse["project"] | null;
    error: string | null;
    loading: boolean;
}

const platformIcons = [
    {deviceType: "PHONE", label: "iPhone", source: "/icons/iphone.svg"},
    {deviceType: "TABLET", label: "iPad", source: "/icons/ipad.svg"},
    {deviceType: "DESKTOP", label: "macOS", source: "/icons/macbook.svg"},
    {deviceType: "AR", label: "Vision Pro", source: "/icons/vision_pro.svg"},
] as const;

function PlatformIcon({label, source, available}: {label: string, source: string, available: boolean}) {
    return (
        <span
            aria-label={label}
            className={`inline-block h-5 w-5 bg-current ${available ? "text-black" : "text-[#909090]"}`}
            role="img"
            style={{
                maskImage: `url(${source})`,
                maskPosition: "center",
                maskRepeat: "no-repeat",
                maskSize: "contain",
                WebkitMaskImage: `url(${source})`,
                WebkitMaskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
            }}
        />
    );
}

export default function ProjectPage() {
    const {projectSlug} = useParams();
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [state, setState] = useState<ProjectPageState>({
        project: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        const projectRequestController = new AbortController();

        async function loadProject() {
            if (!projectSlug) {
                setState({project: null, error: "Project not found.", loading: false});
                return;
            }

            setState({project: null, error: null, loading: true});

            try {
                const projectResponse = await fetch(
                    `${API_URL}/project/${encodeURIComponent(projectSlug)}`,
                    {signal: projectRequestController.signal}
                );

                if (projectResponse.status === 404) {
                    setState({project: null, error: "Project not found.", loading: false});
                    return;
                }

                if (!projectResponse.ok) {
                    setState({project: null, error: "Unable to load this project.", loading: false});
                    return;
                }

                const projectResponseBody = await projectResponse.json() as ProjectDetailsResponse;
                setState({project: projectResponseBody.project, error: null, loading: false});
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setState({project: null, error: "Unable to load this project.", loading: false});
            }
        }

        void loadProject();

        return () => projectRequestController.abort();
    }, [projectSlug]);

    if (state.loading) {
        return <p>Loading project...</p>;
    }

    if (state.error) {
        return <p role="alert">{state.error}</p>;
    }

    if (!state.project) {
        return <p role="alert">Project not found.</p>;
    }

    const {project} = state;
    const availableDeviceTypes = [...new Set(
        project.media
            .filter((media) => media.mediaType === "SCREENSHOT")
            .map((media) => media.deviceType)
    )];
    const developerLabel = project.developers.length === 1 ? "Developer" : "Developers";

    return (
        <article className="w-full max-w-5xl">
            <section className="rounded-2xl bg-[#C6C6C6] p-4 text-black sm:p-5">
                <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center md:gap-8 lg:gap-12">
                    <div className="flex min-w-0 items-center gap-3">
                        <img
                            src={resolveStorageUrl(ICON_BUCKET_URL, project.iconUrl, ".webp")}
                            alt="App icon"
                            className="h-15 w-15 aspect-square shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                            <h1 className="break-words text-xl font-bold [font-family:Museo,sans-serif]">{project.name}</h1>
                            <p className="break-words text-sm [font-family:'Helvetica Neue',Helvetica,sans-serif]">{project.subtitle}</p>
                        </div>
                    </div>
                    <dl className="grid min-w-0 grid-cols-1 gap-y-3 text-xs sm:grid-cols-2 sm:gap-x-8 [font-family:'Helvetica Neue',Helvetica,sans-serif]">
                        <div>
                            <dt className="font-bold">{developerLabel}</dt>
                            <dd>{project.developers.join(", ")}</dd>
                        </div>
                        <div>
                            <dt className="font-bold">Available On</dt>
                            <dd className="mt-1 flex items-center gap-1">
                                {platformIcons.map((platformIcon) => (
                                    <PlatformIcon
                                        key={platformIcon.deviceType}
                                        label={platformIcon.label}
                                        source={platformIcon.source}
                                        available={availableDeviceTypes.includes(platformIcon.deviceType)}
                                    />
                                ))}
                            </dd>
                        </div>
                    </dl>
                    <a
                        href={project.links[0] || "#"}
                        target={project.links[0] ? "_blank" : undefined}
                        rel={project.links[0] ? "noreferrer" : undefined}
                        className="min-w-48 shrink-0 rounded-full bg-[#000054] px-16 py-3 text-center text-sm font-bold text-white [font-family:'Helvetica Neue',Helvetica,sans-serif]"
                    >
                        GET
                    </a>
                </div>
            </section>
            <section className="mt-8">
                <h2 className="text-xl font-bold">Media</h2>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    {project.media
                        .filter((media) => media.mediaType === "SCREENSHOT")
                        .map((media) => (
                            <img
                                key={media.uri}
                                src={resolveStorageUrl(MEDIA_BUCKET_URL, media.uri, ".webp")}
                                alt={`${project.name} screenshot`}
                                className="w-full rounded-lg object-cover"
                            />
                        ))}
                </div>
            </section>
            <section className="mt-8 rounded-2xl bg-[#D9D9D9] px-6 py-10 text-black sm:px-7 sm:py-12">
                <h2 className="text-2xl font-bold">Meet {project.name}.</h2>
                <div
                    className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${descriptionExpanded ? "max-h-[2000px]" : "max-h-40"}`}
                >
                    <p className="mt-3 whitespace-pre-wrap text-xs leading-5">{project.description}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="mt-8 block text-xs font-bold hover:text-r-red"
                >
                    {descriptionExpanded ? "View Less ↑" : "View More ↓"}
                </button>
            </section>
            <section className="mt-8 rounded-2xl bg-[#D9D9D9] px-6 py-10 text-black sm:px-7 sm:py-12">
                <h2 className="text-2xl font-bold">How to Install</h2>
                <div className="mt-3 text-xs leading-5">
                    <p className="font-bold">Available On:</p>
                    <div className="mt-2 flex items-center gap-1">
                        {platformIcons.map((platformIcon) => (
                            <PlatformIcon
                                key={platformIcon.deviceType}
                                label={platformIcon.label}
                                source={platformIcon.source}
                                available={availableDeviceTypes.includes(platformIcon.deviceType)}
                            />
                        ))}
                    </div>
                </div>
                <p className="mt-4 text-xs leading-5">Join the {project.name} Beta with a single tap.</p>
                <p className="mt-2 text-xs leading-5">Choose your device and select TestFlight to begin.</p>
                <p className="mt-2 text-xs leading-5">After installation, open {project.name} from your Home Screen and follow the quick onboarding steps to unlock immersive focus tracking and real-time alerts.</p>
                <a
                    href={project.links[0] || "#"}
                    target={project.links[0] ? "_blank" : undefined}
                    rel={project.links[0] ? "noreferrer" : undefined}
                    className="mt-5 inline-block rounded-full bg-[#000054] px-10 py-2 text-center text-sm font-bold text-white"
                >
                    DOWNLOAD
                </a>
            </section>
        </article>
    );
}