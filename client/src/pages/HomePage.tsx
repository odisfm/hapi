import {useEffect, useState} from "react";
import type {ProjectSearchResponse} from "@hapi/shared/types/apiResponses";
import {API_URL} from "../consts.ts";
import ProjectCard from "../components/ProjectCard.tsx";
import {FaSpinner} from "react-icons/fa";

type HomePageState = {
    projects: ProjectSearchResponse["projects"];
    error: string | null;
    loading: boolean;
};

export default function HomePage() {
    const [state, setState] = useState<HomePageState>({
        projects: [],
        error: null,
        loading: true,
    });

    useEffect(() => {
        const projectRequestController = new AbortController();

        async function loadProjects() {
            try {
                const projectResponse = await fetch(
                    `${API_URL}/project/featured`,
                    {
                        signal: projectRequestController.signal,
                        credentials: "omit"
                    }
                );

                if (!projectResponse.ok) {
                    setState({projects: [], error: "Unable to load projects.", loading: false});
                    return;
                }

                const projectResponseBody = await projectResponse.json() as ProjectSearchResponse;
                setState({projects: projectResponseBody.projects, error: null, loading: false});
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setState({projects: [], error: "Unable to load projects.", loading: false});
            }
        }

        void loadProjects();

        return () => projectRequestController.abort();
    }, []);

    return (
        <div className="-mt-8 w-full px-4 md:px-6 ">
            <section className="relative left-1/2 h-[22.5rem] w-screen -translate-x-1/2 overflow-hidden bg-r-red">
                <div className="absolute inset-0 bg-r-red" aria-hidden="true" />
            </section>

            <section className="w-full py-12 text-black sm:py-16">
                <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-16">
                    <h1 className="font-headline text-[3.5rem] font-bold leading-[1.1] tracking-[-0.02em]">
                        Hub for Apple Platform Innovation (HAPI) <br className="hidden lg:block" />@ RMIT
                    </h1>

                    <div className="px-4 font-copy text-[1rem] font-medium leading-[1.3] tracking-normal text-body-text-gray">
                        <p>
                            Welcome to RMIT&apos;s Hub for Apple Platform Innovation (HAPI), where cutting-edge technology meets transformative learning. Nestled at the intersection of education and industry, HAPI is dedicated to exploring novel computing platforms and mastering the mobile app economy. By fostering a collaborative environment that works closely with Apple and its partners, HAPI enriches student experiences and empowers them to make impactful contributions in the tech industry.
                        </p>
                        <p className="mt-4">
                            HAPI is a vibrant centre for both teaching and research. We offer a unique curriculum that integrates Apple&apos;s latest design frameworks and developer tools, providing students with hands-on opportunities to develop expertise in app development and design for Apple platforms. Our teaching efforts are encapsulated in the &apos;Design &amp; Develop for Apple Platforms&apos; minor, featuring courses like &quot;UI and UX for Apple Platforms&quot; and &quot;Getting started with iOS App Development&quot;, which are available to all undergraduate students across RMIT.
                        </p>
                    </div>
                </div>
            </section>

            <section className="w-full pb-12 pt-12 text-black sm:pb-40 sm:pt-20">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="flex items-center justify-between">
                        <div className={`flex gap-2 items-center`}>
                            <h2
                                className="font-copy text-2xl font-bold leading-[1.3] tracking-normal"
                            >
                                FEATURED PROJECTS
                            </h2>
                            { state.loading &&
                                <FaSpinner className={`animate-spin text-2xl`} />
                            }
                        </div>
                        <button
                            type="button"
                            className="font-copy flex cursor-pointer items-center gap-1 p-0 text-[0.8rem] font-bold uppercase leading-[1.3] tracking-normal text-black"
                        >
                            VIEW MORE <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    { state.error ? (
                        <p className="mt-6" role="alert">{state.error}</p>
                    ) : state.loading ? (
                        <div className={"h-30"}></div>
                    ) :  state.projects.length === 0 && !state.loading ? (
                        <p className="mt-6">No projects found.</p>
                    ) :  (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {state.projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    name={project.name}
                                    subtitle={project.subtitle}
                                    iconUrl={project.iconUrl}
                                    slug={project.slug}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}