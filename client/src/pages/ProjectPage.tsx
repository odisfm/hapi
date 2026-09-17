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

export default function ProjectPage() {
    const {projectSlug} = useParams();
    const [state, setState] = useState<ProjectPageState>({
        project: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        const controller = new AbortController();

        async function loadProject() {
            if (!projectSlug) {
                setState({project: null, error: "Project not found.", loading: false});
                return;
            }

            setState({project: null, error: null, loading: true});

            try {
                const response = await fetch(
                    `${API_URL}/project/${encodeURIComponent(projectSlug)}`,
                    {signal: controller.signal}
                );

                if (response.status === 404) {
                    setState({project: null, error: "Project not found.", loading: false});
                    return;
                }

                if (!response.ok) {
                    setState({project: null, error: "Unable to load this project.", loading: false});
                    return;
                }

                const data = await response.json() as ProjectDetailsResponse;
                setState({project: data.project, error: null, loading: false});
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setState({project: null, error: "Unable to load this project.", loading: false});
            }
        }

        void loadProject();

        return () => controller.abort();
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

    return (
        <article className="w-full max-w-3xl">
            <img
                src={resolveStorageUrl(ICON_BUCKET_URL, project.iconUrl, ".webp")}
                alt="App icon"
                className="h-15 w-15 aspect-square rounded-xl object-cover"
            />
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="mt-1">{project.subtitle}</p>
            <dl className="mt-4">
                <dt className="font-bold">Developers</dt>
                <dd>{project.developers.join(", ")}</dd>
                <dt className="mt-3 font-bold">Category</dt>
                <dd>{project.category}</dd>
            </dl>
            <section className="mt-6">
                <h2 className="text-xl font-bold">Description</h2>
                <p className="mt-2 whitespace-pre-wrap">{project.description}</p>
            </section>
            <section className="mt-6">
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
        </article>
    );
}