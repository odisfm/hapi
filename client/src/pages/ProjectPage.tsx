import {useEffect, useMemo, useRef, useState} from "react";
import {useParams} from "react-router";
import {MdExpandMore} from "react-icons/md";
import type {ProjectDetailsResponse} from "@hapi/shared/types/apiResponses";
import {API_URL, deviceEnumFriendly} from "../consts.ts";
import {AppIcon} from "../components/AppIcon.tsx";
import Markdown from "react-markdown";
import {FaApple, FaSpinner } from "react-icons/fa";
import {MediaCarousel} from "../components/MediaCarousel.tsx";
import type {DeviceType} from "@hapi/shared/prisma/enums";


function getLinkType(url: string) {
    if (url.includes("apps.apple.com")) {
        return "App Store";
    }

    if (url.includes("testflight.apple.com")) {
        return "TestFlight";
    }

    if (url.includes("github.com")) {
        return "GitHub";
    }

    return "Website";
}

type ProjectPageState = {
    project: ProjectDetailsResponse["project"] | null;
    error: string | null;
    loading: boolean;
}

const mediaPlatformIconSources: Record<keyof typeof deviceEnumFriendly, string> = {
    PHONE: "/icons/iphone.svg",
    TABLET: "/icons/ipad.svg",
    DESKTOP: "/icons/macbook.svg",
    WATCH: "/icons/applewatch.svg",
    AR: "/icons/vision_pro.svg",
    TV: "/icons/tv.svg",
};

const platformIconOrder = ["PHONE", "TABLET", "DESKTOP", "AR", "WATCH", "TV"] as const;

const platformIcons = platformIconOrder.map((deviceType) => ({
    deviceType,
    label: deviceEnumFriendly[deviceType],
    source: mediaPlatformIconSources[deviceType],
}));

function PlatformIcon({label, source, available, selected = false}: {label: string, source: string, available: boolean, selected?: boolean}) {
    return (
        <span
            aria-label={label}
            className={`inline-block h-5 w-5 bg-current ${selected ? "text-[#000054]" : available ? "text-black" : "text-[#909090]"}`}
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
    const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
    const [deviceFilterOpen, setDeviceFilterOpen] = useState(false);
    const [selectedLinkType, setSelectedLinkType] = useState<string | null>(null);
    const [linkDropdownOpen, setLinkDropdownOpen] = useState(false);
    const [state, setState] = useState<ProjectPageState>({
        project: null,
        error: null,
        loading: true,
    });
    const deviceFilterRef = useRef<HTMLDivElement>(null);
    const linkDropdownRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!state.project || !selectedDeviceType) {
            return;
        }

        const availableDeviceTypes = [...new Set(
            state.project.media
                .filter((media) => media.mediaType === "SCREENSHOT")
                .map((media) => media.deviceType)
        )];

        if (!availableDeviceTypes.some((deviceType) => deviceType === selectedDeviceType)) {
            const animationFrame = requestAnimationFrame(() => setSelectedDeviceType(null));

            return () => cancelAnimationFrame(animationFrame);
        }
    }, [selectedDeviceType, state.project]);

    useEffect(() => {
        if (!deviceFilterOpen) {
            return;
        }

        const closeDeviceFilter = (event: MouseEvent) => {
            if (!deviceFilterRef.current?.contains(event.target as Node)) {
                setDeviceFilterOpen(false);
            }
        };
        const closeDeviceFilterOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setDeviceFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", closeDeviceFilter);
        document.addEventListener("keydown", closeDeviceFilterOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeDeviceFilter);
            document.removeEventListener("keydown", closeDeviceFilterOnEscape);
        };
    }, [deviceFilterOpen]);

    useEffect(() => {
        if (!linkDropdownOpen) {
            return;
        }

        const closeLinkDropdown = (event: MouseEvent) => {
            if (!linkDropdownRef.current?.contains(event.target as Node)) {
                setLinkDropdownOpen(false);
            }
        };
        const closeLinkDropdownOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setLinkDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", closeLinkDropdown);
        document.addEventListener("keydown", closeLinkDropdownOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeLinkDropdown);
            document.removeEventListener("keydown", closeLinkDropdownOnEscape);
        };
    }, [linkDropdownOpen]);


    useEffect(() => {
        if (!document.scrollingElement) return
        document.scrollingElement.scrollTop = 0
    }, []);

    const filteredScreenshotMedia = useMemo(() => {
        if (!state.project) return []
        if (!selectedDeviceType) return state.project.media.filter((media) => {
            return media.mediaType === "SCREENSHOT" && media.status === "AVAILABLE"
        });
        return state.project.media.filter((media) => {
            return media.deviceType === selectedDeviceType &&
                media.status === "AVAILABLE" &&
                media.mediaType === "SCREENSHOT"

        })

    }, [selectedDeviceType, state.project])

    const videoUrl: string | null = useMemo(() => {
        if (!state.project || !state.project.media) return null;
        for (const m of state.project.media) {
            if (m.mediaType === "VIDEO" && m.status === "AVAILABLE") return m.uri
        }
        return null;
    }, [state.project]);

    useEffect(() => {
        if (!state.project) return

        function getDeviceType(): DeviceType {
            const isTouch = window.matchMedia('(pointer: coarse)').matches;
            if (!isTouch) return 'DESKTOP';

            const shortSide = Math.min(window.screen.width, window.screen.height);
            return shortSide < 600 ? 'PHONE' : 'TABLET';
        }

        const deviceType = getDeviceType();
         (async () => {
            for (const m of state.project!.media) {
                if (m.deviceType === deviceType) {
                    return setSelectedDeviceType(deviceType)
                }
            }
            setSelectedDeviceType(null);
        })()

    }, [state.project]);

    if (state.loading) {
        return <FaSpinner className={`text-[5rem] mt-20 animate-spin`}/>;
    }

    if (state.error) {
        return <p className="font-copy" role="alert">{state.error}</p>;
    }

    if (!state.project) {
        return <p className="font-copy" role="alert">Project not found.</p>;
    }

    const {project} = state;
    const screenshotMedia = project.media.filter((media) => media.mediaType === "SCREENSHOT");
    const availableDeviceTypes = [...new Set(
        screenshotMedia
            .map((media) => media.deviceType)
    )];
    const mediaPlatformIcons = availableDeviceTypes.map((deviceType) => ({
        deviceType,
        label: deviceEnumFriendly[deviceType as keyof typeof deviceEnumFriendly],
        source: mediaPlatformIconSources[deviceType as keyof typeof mediaPlatformIconSources],
    }));
    const displayedPlatformIcons = [
        ...platformIcons.filter((platformIcon) => availableDeviceTypes.includes(platformIcon.deviceType)),
        ...platformIcons.filter((platformIcon) => !availableDeviceTypes.includes(platformIcon.deviceType)),
    ].slice(0, 4);

    const detectedLinks = project.links.map((url) => ({url, type: getLinkType(url)}));
    const detectedLinkTypes = [...new Set(detectedLinks.map((link) => link.type))];
    const selectedLink = detectedLinks.find((link) => link.type === selectedLinkType);
    const developerLabel = project.developers.length === 1 ? "Developer" : "Developers";


    return (
        <article className="w-full max-w-5xl font-copy">
            <section className="rounded-2xl bg-[#C6C6C6] p-4 text-black sm:p-5">
                <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center md:gap-8 lg:gap-12">
                    <div className="flex min-w-0 items-center gap-3">
                        <AppIcon uri={project.iconUrl} width={80} />
                        <div className="min-w-0">
                            <h1 className="break-words text-xl font-bold">{project.name}</h1>
                            <p className="break-words text-sm font-copy">{project.subtitle}</p>
                        </div>
                    </div>
                    <dl className="grid min-w-0 grid-cols-1 gap-y-3 text-xs sm:grid-cols-3 sm:gap-x-8 font-copy">
                        <div>
                            <dt className="font-bold">{developerLabel}</dt>
                            <dd>{project.developers.join(", ")}</dd>
                        </div>
                        <div>
                            <dt className="font-bold">Category</dt>
                            <dd>{project.category}</dd>
                        </div>
                        <div>
                            <dt className="font-bold">Available On</dt>
                            <dd className="mt-1 flex items-center gap-1">
                                {displayedPlatformIcons.map((platformIcon) => (
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
                    {
                        project.links.length > 0 ?
                            <a
                                onClick={(event) => {
                                    event.preventDefault();
                                    document.getElementById("how-to-install")?.scrollIntoView({behavior: "smooth"});
                                }}
                                className="min-w-48 shrink-0 rounded-full bg-[#000054] px-16 py-3 text-center text-sm font-bold text-white font-copy cursor-pointer"
                            >
                                GET
                            </a>
                            :
                            <a
                                href={`mailto:hapi@rmit.edu.au`}
                                className="min-w-48 shrink-0 rounded-full bg-[#000054] px-16 py-3 text-center text-sm font-bold text-white font-copy cursor-pointer"
                            >
                                CONTACT US
                            </a>
                    }
                </div>
            </section>
            <section className="mt-8">
                <div className="relative">
                    <MediaCarousel
                        media={filteredScreenshotMedia}
                        videoUrl={videoUrl}
                        projectName={project.name}
                    />
                    {availableDeviceTypes.length > 1 && (
                        <div ref={deviceFilterRef} className="relative mt-5 ml-auto flex w-max justify-end">
                            <button
                                type="button"
                                aria-expanded={deviceFilterOpen}
                                aria-haspopup="menu"
                                onClick={() => setDeviceFilterOpen(!deviceFilterOpen)}
                                className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                            >
                                <span className="flex items-center gap-1">
                                    {mediaPlatformIcons.map((platformIcon) => (
                                        <PlatformIcon
                                            key={platformIcon.deviceType}
                                            label={platformIcon.label}
                                            source={platformIcon.source}
                                            available
                                        />
                                    ))}
                                </span>
                                <span>
                                    Showing {selectedDeviceType ? deviceEnumFriendly[selectedDeviceType] : "all devices"
                                }</span>
                            </button>
                            {deviceFilterOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full z-10 mt-2 w-min rounded-lg bg-white shadow-lg p-2 pr-4"
                                >
                                    <button
                                        type="button"
                                        role="menuitem"
                                        aria-pressed={selectedDeviceType === null}
                                        onClick={() => setSelectedDeviceType(null)}
                                        className={`
                                        flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs cursor-pointer 
                                        ${!selectedDeviceType ? "text-black" : "text-[#909090]"}
                                        text-nowrap
                                        `}
                                    >
                                        <FaApple size={16} className={`shrink-0`}/> <span>View all devices</span>
                                    </button>
                                    {mediaPlatformIcons.map((platformIcon) => {
                                        const selected = selectedDeviceType === platformIcon.deviceType;

                                        return (
                                            <button
                                                key={platformIcon.deviceType}
                                                type="button"
                                                role="menuitem"
                                                aria-pressed={selected}
                                                onClick={() => setSelectedDeviceType(selected ? null : platformIcon.deviceType)}
                                                className={`
                                                flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs cursor-pointer
                                                ${selected ? "text-black" : "text-[#909090]"}
                                                `}
                                            >
                                                <PlatformIcon
                                                    label={platformIcon.label}
                                                    source={platformIcon.source}
                                                    available={selected}
                                                />
                                                <span>View {platformIcon.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
            <section className={`
            project-description mt-8 rounded-2xl bg-[#D9D9D9] px-6 pt-10 pb-4 text-black sm:px-7
            `}>
                <div className={`
                pr-6 md:pr-32 overflow-hidden
                transition-[max-height] duration-200 ease-in-out 
                ${descriptionExpanded ? "max-h-[2000px]" : "max-h-100"} sm:pb-5
                `}>
                    <Markdown>
                        {project.description}
                    </Markdown>
                </div>
                <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="mb-1 mt-8 block text-left  text-xs font-bold hover:text-r-red cursor-pointer"
                >
                    {descriptionExpanded ? "View Less ↑" : "View More ↓"}
                </button>
            </section>
            {project.links.length > 0 &&
                <section id="how-to-install"
                         className="mt-8 rounded-2xl bg-[#D9D9D9] px-6 pb-16 pt-10 text-black sm:px-7 sm:pb-20 sm:pt-12">
                    <h2 className="text-2xl font-bold">Get {project.name}</h2>
                    <div className="mt-3 text-xs leading-5">
                        <p className="font-bold">Available On:</p>
                        <div className="mt-2 flex items-center gap-1">
                            {displayedPlatformIcons.map((platformIcon) => (
                                <PlatformIcon
                                    key={platformIcon.deviceType}
                                    label={platformIcon.label}
                                    source={platformIcon.source}
                                    available={availableDeviceTypes.includes(platformIcon.deviceType)}
                                />
                            ))}
                        </div>
                    </div>
                    {detectedLinkTypes.length <= 1 ? (
                        <a
                            href={project.links[0] || "#"}
                            target={project.links[0] ? "_blank" : undefined}
                            rel={project.links[0] ? "noreferrer" : undefined}
                            className="mt-8 inline-block rounded-full bg-[#000054] px-10 py-2 text-center text-sm font-bold text-white"
                        >
                            {detectedLinkTypes[0]?.toUpperCase() || "DOWNLOAD"}
                        </a>
                    ) : (
                        <div ref={linkDropdownRef} className="relative mt-8 inline-flex text-sm font-bold text-white">
                            {selectedLink ? (
                                <a
                                    href={selectedLink.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-l-full bg-[#000054] px-10 py-2 text-center"
                                >
                                    {selectedLink.type.toUpperCase()}
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    className="rounded-l-full bg-[#000054] px-10 py-2 text-center"
                                >
                                    DOWNLOAD
                                </button>
                            )}
                            <button
                                type="button"
                                aria-label="Choose download link"
                                aria-expanded={linkDropdownOpen}
                                aria-haspopup="menu"
                                onClick={() => setLinkDropdownOpen(!linkDropdownOpen)}
                                className="rounded-r-full bg-[#000054] px-3 py-2"
                            >
                                <MdExpandMore/>
                            </button>
                            {linkDropdownOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full z-10 mt-2 w-full rounded-lg bg-white p-1 text-xs text-black shadow-lg"
                                >
                                    {detectedLinkTypes.map((linkType) => (
                                        <button
                                            key={linkType}
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setSelectedLinkType(linkType);
                                                setLinkDropdownOpen(false);
                                            }}
                                            className="block w-full rounded-md px-3 py-2 text-left hover:bg-[#D9D9D9]"
                                        >
                                            {linkType}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <a
                        href="mailto:hapi@rmit.edu.au"
                        className="ml-3 mt-8 inline-block rounded-full bg-[#909090] px-10 py-2 text-center text-sm font-bold text-white"
                    >
                        CONTACT US
                    </a>
                </section>
            }
        </article>
    );
}