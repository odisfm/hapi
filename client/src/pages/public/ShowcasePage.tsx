import {useParams} from "react-router";
import {useCallback, useEffect, useMemo, useState} from "react";
import {API_URL} from "../../consts.ts";
import type {ShowcasePublicDetailsResponse} from "@hapi/shared/types/apiResponses";
import type {ShowcaseType} from "@hapi/shared/types/showcase";
import Markdown from "react-markdown";
import {FaSpinner} from "react-icons/fa";
import ProjectCard from "../../components/ProjectCard.tsx";
import {HeroProjectCard} from "../../components/HeroProjectCard.tsx";
import {Error404} from "./Error404.tsx";

export function ShowcasePage() {
    const [showcase, setShowcase] = useState<ShowcaseType | null>(null);
    const [loading, setLoading] = useState(true);
    const {showcaseSlug} = useParams();

    const getShowcase = useCallback(async () => {
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/showcase/${showcaseSlug}`);

            if (!res.ok) {
                console.error(res);
                return;
            }

            const json: ShowcasePublicDetailsResponse = await res.json();
            setShowcase(json.showcase);
        } catch (e) {
            console.error(e);
            setShowcase(null);
        } finally {
            setLoading(false);
        }
    }, [showcaseSlug]);

    useEffect(() => {
        (() => {
            getShowcase();
        })();
    }, [getShowcase]);

    const showcaseProjects = showcase?.projects;

    const featuredProjects = useMemo(() => {
        if (!showcaseProjects || showcaseProjects.length < 4) {
            return [];
        }

        const projectsWithHeroArt = showcaseProjects.filter(
            (project) => project.heroArtUrl !== undefined
        );

        const candidates =
            projectsWithHeroArt.length >= 3
                ? projectsWithHeroArt
                : showcaseProjects;

        return candidates.slice(0, 3);
    }, [showcaseProjects]);

    const featuredProjectIdSet = new Set(
        featuredProjects.map((project) => project.id)
    );

    const remainingProjects =
        showcaseProjects?.filter(
            (project) => !featuredProjectIdSet.has(project.id)
        ) ?? [];

    if (!loading && !showcase) {
        return <Error404 />;
    }

    if (loading || !showcase) {
        return <div className={`w-full flex justify-center`}>
            <FaSpinner className={`text-[5rem] mt-20 animate-spin self-center`}/>
        </div>;
    }

    return (
        <div className="flex flex-col">
            <div
                className={`
                    ${showcase.description ? "grid" : ""}
                    grid-rows-auto grid-cols-1
                    md:grid-rows-1 md:grid-cols-2
                    gap-2 md:gap-12 md:grid-cols-[300px_300px]
                `}
            >
                <div
                    className={`
                        flex flex-col items-start text-left gap-4
                        ${showcase.description ? "md:items-end md:text-right" : ""}
                    `}
                >
                    <h1 className="text-5xl font-headline">
                        {showcase.name}
                        {showcase.year && ` ${showcase.year}`}
                    </h1>

                    {showcase.year && showcase.semester ? (
                        <h2 className="font-bold uppercase text-lg">
                            Semester {showcase.semester}
                        </h2>
                    ) : null}
                </div>

                {showcase.description && (
                    <div className="showcase-description">
                        <Markdown>
                            {showcase.description}
                        </Markdown>
                    </div>
                )}
            </div>

            <h3 className="font-bold text-xl mt-6">
                PROJECTS
            </h3>

            {featuredProjects.length === 3 && (
                <div
                    className="mt-6 hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-3"
                    data-testid="showcase-featured-projects"
                >
                    {featuredProjects.map((project) => (
                        <HeroProjectCard
                            key={project.id}
                            project={project}
                        />
                    ))}
                </div>
            )}

            <div
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
                data-testid="showcase-project-grid"
            >
                {featuredProjects.length === 3 &&
                    featuredProjects.map((project) => (
                        <div key={project.id} className="lg:hidden">
                            <ProjectCard
                                name={project.name}
                                iconUrl={project.iconUrl}
                                slug={project.slug}
                                subtitle={project.subtitle}
                            />
                        </div>
                    ))}
                {remainingProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        name={project.name}
                        iconUrl={project.iconUrl}
                        slug={project.slug}
                        subtitle={project.subtitle}
                    />
                ))}
            </div>
        </div>
    );
}