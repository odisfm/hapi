import * as z from "zod"
import {MarkdownEditor} from "../generic/MarkdownEditor.tsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useBlocker, useNavigate, useParams} from "react-router";
import type {ProjectAdminType} from "@hapi/shared/types/project";
import {API_URL} from "../../consts.ts";
import type {
    CategoryResponse,
    ProjectDetailsAdminResponse,
    ShowcaseListResponse
} from "@hapi/shared/types/apiResponses";
import type {Category, Showcase} from "@hapi/shared/prisma/client";
import {TextItemEditor} from "./TextItemEditor.tsx";
import {formatDate, formatDistance} from "date-fns";
import {FaSpinner, FaTrash} from "react-icons/fa";
import {UpdateProjectRequestSchema, type UpdateProjectRequestType} from "@hapi/shared/types/apiRequests";
import {createUuid} from "../../utils/misc.ts";
import {useModal} from "../../contexts/modal/useModal.ts";
import {MediaEditor} from "./MediaEditor/MediaEditor.tsx";
import {RiImageUploadFill} from "react-icons/ri";
import ProjectCard from "../ProjectCard.tsx";
import {SlugEditor} from "./SlugEditor.tsx";
import {SaveButton} from "../generic/SaveButton.tsx";
import { VideoEditor } from "./VideoEditor.tsx";
import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";

const legendStyles = `font-medium`
const inputStyles = `p-1 rounded-md bg-neutral-200 px-2 py-1 font-light`
const selectStyles = inputStyles + ``

type ShowcaseListItem = {
    name: string,
    id: string,
    date: Date | null
}

type DetailsTab = "description" | "media" | "video"


export function ProjectEditor() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<ProjectAdminType | null>(null);
    const params = useParams();
    const projectId = params.projectId!;
    const [projectName, setProjectName] = useState<string>('');
    const [subtitle, setSubtitle] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [developers, setDevelopers] = useState<string[]>([]);
    const [showcases, setShowcases] = useState<Showcase[]>([]);
    const [selectedShowcase, setSelectedShowcase] = useState<Showcase | null>(null);
    const [links, setLinks] = useState<string[]>([]);
    const [hasChanged, setHasChanged] = useState(false);
    const descriptionRef = useRef<string>("");
    const categoryRef = useRef<HTMLSelectElement | null>(null);
    const isNewProject = useRef(projectId === "new");
    const modalContext = useModal();
    const [detailsTab, setDetailsTab] = useState<DetailsTab>("description");
    const iconUploadRef = useRef<HTMLInputElement | null>(null);
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanged && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (!document.scrollingElement) return
        document.scrollingElement.scrollTop = 0
    }, []);

    const createNewProject = useCallback(async () => {
        try {

            const categoryRes = await fetch(`${API_URL}/category`, {
                credentials: "include",
            })
            const showcaseRes = await fetch(`${API_URL}/showcase/all`, {
                credentials: "include",
            })

            if (!categoryRes.ok || !showcaseRes.ok) {
                console.error(categoryRes)
                console.error(showcaseRes)
                throw new Error("Failed to fetch category/showcase details")
            }

            const categoryJson: CategoryResponse = await categoryRes.json();
            const showcaseJson: ShowcaseListResponse = await showcaseRes.json();
            console.log(showcaseJson)
            const showcaseId = (() => {
                const now = new Date();
                for (const s of showcaseJson.showcases) {
                    if (s.publishedDate && s.publishedDate > now) {
                        return s.id
                    }
                }
                return showcaseJson.showcases[0].id
            })()

            const newProjectData = {
                id: createUuid(),
                name: "My cool project",
                subtitle: "It's not just x — it's y",
                developers: [],
                media: [],
                showcaseId,
                links: [],
                categoryId: categoryJson.categories[0].id,
                order: "zzzz",
                slug: "",
                description: "",
                iconUrl: "",
                published: false,
                rejectionReason: "",
                approvalStatus: "APPROVED",
                featured: false
            }

            console.log(newProjectData);

            const res = await fetch(`${API_URL}/project`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({project: newProjectData})
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }

            const json: ProjectDetailsAdminResponse = await res.json();
            const newProject = json.project

            setLoading(false);
            setProjectName(newProject.name)
            setSubtitle(newProject.subtitle || "")
            setProject(newProject)

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to create new project",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
            return
        }
    }, [modalContext])

    const getProject = useCallback(async () => {
        let res: Response
        try {
            res = await fetch(`${API_URL}/project/id/${projectId}`, {
                method: "GET",
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to get project");
            }

            const json: ProjectDetailsAdminResponse = await res.json();
            setProject(json.project)
            setLoading(false);
            setProjectName(json.project.name)
            setSubtitle(json.project.subtitle || "")
            setDevelopers(json.project.developers)
            setLinks(json.project.links)

        } catch (e) {
            console.error(e)
        }
    }, [projectId])

    useEffect(() => {
        (async () => {
            if (isNewProject.current) {
                createNewProject();
                return
            }
           await getProject();
        })()

    }, [projectId, getProject, createNewProject])

    useEffect(() => {
        (async () => {
           let res: Response
           try {
               res = await fetch(`${API_URL}/category`, {
                   method: "GET",
                   credentials: "include",
               })
               if (!res.ok) {
                   console.error(res)
                   throw new Error("Failed to get categories");
               }
               const json: CategoryResponse = await res.json();
               setCategories(json.categories.sort((a, b) => {
                   if (a.name < b.name) return -1;
                   else if (a.name > b.name) return 1;
                   else return 0
               }))

           } catch (e) {
               console.error(e)
           }
        })()
    }, []);

    useEffect(() => {
        (async () => {
            let res: Response
            try {
                res = await fetch(`${API_URL}/showcase/all`, {
                    credentials: "include",
                })
                if (!res.ok) {
                    console.error(res)
                    throw new Error("Failed to get showcases");
                }
                const json: ShowcaseListResponse = await res.json();
                setShowcases(json.showcases)

            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    const showcaseItems: ShowcaseListItem[] = useMemo(() => {
        const sorted =
            [...showcases].sort((a, b) => {
                if (a.publishedDate === b.publishedDate) return 0
                else if (!a.publishedDate) return -1;
                else if (!b.publishedDate) return 1
                else if (a.publishedDate < b.publishedDate) {
                    return -1
                } else if (a.publishedDate > b.publishedDate) {
                    return 1
                }
                return 0
        })

        return sorted.map((s) => {
            let name = `${s.name}`
            if (s.year) name += ` ${s.year}`
            if (s.semester) name += ` Sem ${s.semester}`
            return {name, id: s.id, date: s.publishedDate}
        })

    }, [showcases])

    const showcaseDate: string = useMemo(() => {
        if (!selectedShowcase || !project) return ""
        if (!project.published) return "Project will not be published until status changed."
        if (!selectedShowcase.publishedDate) return "Showcase has no publish date."
        let friendlyDate = "Project will be published with showcase "
        const date = new Date(selectedShowcase.publishedDate)
        const now = new Date()
        if (now > date) return "Showcase is published. Project will be live immediately."
        friendlyDate += `in ${formatDistance(date, now)}`
        return `${friendlyDate}. (${formatDate(date, "HH:mm dd/M/yyyy")})`
    }, [selectedShowcase, project])

    useEffect(() => {
        (async() => {
            if (!project) return
            if (showcaseItems.length > 0 && !selectedShowcase) {
                const match = showcases.find(s => s.id === project.showcaseId)
                    ?? showcases.find(s => s.id === showcaseItems[0].id);
                if (match) setSelectedShowcase(match);
            }
        })()
    }, [showcaseItems, showcases, selectedShowcase, project]);

    const submit = useCallback(async (newProject?: ProjectAdminType) => {
        let update
        if (!project && !newProject) return
        const submitProject = newProject || project!
        try {
            update = UpdateProjectRequestSchema.parse({
                project: {
                    id: submitProject.id,
                    name: projectName,
                    description: descriptionRef.current.valueOf(),
                    subtitle: subtitle,
                    links,
                    developers,
                    categoryId: categoryRef.current!.value,
                    showcaseId: selectedShowcase!.id,
                    media: submitProject!.media,
                    approvalStatus: "APPROVED",
                    rejectionReason: null,
                    iconUrl: submitProject!.iconUrl,
                    published: submitProject.published,
                    featured: submitProject.featured,
                },
            })
        } catch (e) {
            if (e instanceof z.ZodError) {
                console.error(e)
                for (const m of e.issues) {
                    console.error(m.path)
                    console.error(m.message)
                }
                return
            }
        }

        let res: Response
        try {
            res = await fetch(`${API_URL}/project`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify(update! satisfies UpdateProjectRequestType),
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to update project")
            }
            setHasChanged(false)
            isNewProject.current = false
            await getProject()

        } catch (e) {
            console.error(e)
        }
    }, [developers, links, project, projectName, selectedShowcase, subtitle, getProject])

    const uploadIcon = useCallback(async (e: React.ChangeEvent) => {
        if (!project) return
        const input = e.target as HTMLInputElement
        if (!input.files || !input.files.length) return
        const file = input.files[0]
        const formData = new FormData()
        formData.append('file', file)

        let res: Response
        try {
            res = await fetch(`${API_URL}/media/icon`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to upload image")
            }
            const json = await res.json()
            if (!json.uri) {
                throw new Error("Didn't get upload URI")
            } else {
                const uri: string = json.uri
                const newProject = {...project, iconUrl: uri}
                setProject(newProject)
                await submit(newProject)
            }

        } catch (e) {
            await modalContext.dispatchModal({
                headline: "Failed to upload icon",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }

    }, [project, submit, modalContext])

    async function deleteProject() {
        if (!project) return
        const result = await modalContext.dispatchModal({
            headline: `Delete ${project?.name || "project"}?`,
            body: `Project and all related assets will be deleted immediately.\nThis is not reversible.`,
            buttons: [
                {text: "Cancel", variant: "default", id: "cancel"},
                {text: "Delete", variant: "danger", id: "confirm"}
            ]
        })
        if (result === "cancel") return

        let res: Response
        try {
            res = await fetch(`${API_URL}/project/${project.id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to delete project")
            }
            navigate("/dashboard")

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to delete project",
                body: "Try again later.",
                buttons: [{text: "OK", id: "ok", variant: "default"}]
            })
        }
    }

    const preventUnload = useCallback((e: BeforeUnloadEvent) => {
        e.preventDefault()
    }, [])

    useEffect(() => {
        if (hasChanged) {
            window.addEventListener("beforeunload", preventUnload)
        } else {
            window.removeEventListener("beforeunload", preventUnload)
        }

        return () => {
            window.removeEventListener("beforeunload", preventUnload)
        }

    }, [preventUnload, hasChanged]);

    useEffect(() => {
        if (blocker.state === "blocked") {
            const confirm = window.confirm("You have unsaved changes. Leave anyway?")
            if (confirm) blocker.proceed()
            else blocker.reset();
        }
    }, [blocker]);

    const updateScreenshots = useCallback((newScreenshots: ProjectMediaType[]) => {
        if (!project) return
        const videos = project.media.filter(
            m => {return m.mediaType === "VIDEO"}
        )
        setProject({
            ...project,
            media: [...videos, ...newScreenshots]
        })
    }, [project])

    if (loading) return (
        <>
            <FaSpinner className={`animate-spin`}/>
        </>
    )

    console.log({project, selectedShowcase})

    return (
        <>
            { project && categories.length &&
                <div className={"flex flex-col gap-2 w-full md:w-4/5 lg:w-2/5 mt-8"}>
                    <div className={`flex gap-4 w-full`}>
                        <div className={`flex flex-col gap-2 w-full`}>
                            <div className={`pointer-events-none`}>
                                <ProjectCard name={projectName} subtitle={subtitle} iconUrl={project.iconUrl} slug={""}/>
                            </div>
                                <form
                                    className={`flex flex-col gap-1 items-start`}
                                    encType="multipart/form-data"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        await uploadIcon(e)
                                    }}
                                >
                                <input
                                    ref={iconUploadRef}
                                    onChange={(e) => uploadIcon(e)}
                                    type={"file"}
                                    accept={".png,.jpg,.jpeg,.tiff,.svg,.webp,.heif"}
                                    name={"iconInput"}
                                    className={'hidden'}
                                />
                                    <div className={`flex gap-2 w-full`}>
                                        <button className={`
                                            bg-r-yellow-500 hover:bg-r-yellow-400 cursor-pointer
                                            flex items-center gap-2 p-2 rounded-full
                                            `}
                                            onClick={() => {
                                                iconUploadRef.current!.click()
                                            }}
                                        >
                                            <RiImageUploadFill />
                                        </button>
                                        <SaveButton onClick={() => submit()} hasChanged={hasChanged} />
                                    </div>
                            </form>
                        </div>

                    </div>
                    <form
                        className={`flex flex-col gap-4 mt-4`}
                        onSubmit={(e) => {
                            e.preventDefault()
                            submit()
                        }}
                    >
                        <fieldset>
                            <legend className={legendStyles}>Project name</legend>
                            <input
                                name={"name"}
                                defaultValue={projectName}
                                onChange={(e) => {
                                    setHasChanged(true)
                                    setProjectName(e.target.value)
                                }}
                                className={`${inputStyles} w-full`}
                                required
                            />
                        </fieldset>
                        <fieldset>
                            <legend className={legendStyles}>Subtitle</legend>
                            <input
                                name={"subtitle"}
                                defaultValue={subtitle}
                                onChange={(e) => {
                                    setHasChanged(true)
                                    setSubtitle(e.target.value)
                                }}
                                className={`${inputStyles} w-full`}
                                required
                            />
                        </fieldset>
                        {showcaseItems.length > 0 &&
                            <>
                                <fieldset>
                                    <legend className={legendStyles}>Showcase</legend>
                                    <select
                                        name={"showcase"}
                                        value={selectedShowcase?.id ?? ""}
                                        className={`${selectStyles}`}
                                        onChange={(e) => {
                                            setHasChanged(true)
                                            setSelectedShowcase(
                                                showcases[showcases.
                                                findIndex(s => s.id === e.target.value)])
                                        }}
                                        required
                                    >
                                        {showcaseItems.map((s, i) => {
                                            return (
                                                <option key={i} value={s.id}>{s.name}</option>
                                            )
                                        })}
                                    </select>
                                </fieldset>
                            </>
                        }
                        <fieldset>
                            <legend className={legendStyles}>Status</legend>
                            <div className={`flex gap-2 items-center`}>
                                <input
                                    name={"published"}
                                    id={"publishedTrue"}
                                    type={"radio"}
                                    value={1}
                                    checked={project.published}
                                    onChange={() => {
                                        setProject({
                                            ...project,
                                            published: true
                                        })
                                        setHasChanged(true)
                                    }}
                                    required
                                />
                                <label htmlFor={"publishedTrue"} className={`font-light`}>Published</label>
                                <input
                                    name={"published"}
                                    id={"publishedFalse"}
                                    type={"radio"}
                                    value={0}
                                    checked={!project.published}
                                    onChange={() => {
                                        setProject({
                                            ...project,
                                            published: false
                                        })
                                        setHasChanged(true)
                                    }}
                                    required
                                />
                                <label htmlFor={"publishedFalse"} className={`font-light`}>Unpublished</label></div>
                        </fieldset>
                        {showcaseDate &&
                            <span className={`text-xs`}>
                                    {showcaseDate.split("(")[0]}
                                {showcaseDate.includes("(") &&
                                    <span
                                        className={`font-bold text-xs`}>{showcaseDate.split("(")[1].slice(0, -1)}</span>}
                                </span>}

                        <fieldset>
                            <legend className={legendStyles}>Category</legend>
                            <select
                                name={"category"}
                                defaultValue={project.category}
                                className={`${selectStyles}`}
                                ref={categoryRef}
                                required
                            >
                                {categories.map((c, i) => {
                                    return (
                                        <option key={i} value={c.id}>{c.name}</option>
                                    )
                                })}
                            </select>
                        </fieldset>
                        <fieldset>
                            <legend className={legendStyles}>Developers</legend>
                            <TextItemEditor
                                items={developers}
                                setItems={(items) => {
                                    setHasChanged(true)
                                    setDevelopers(items)
                                }}
                                placeholder={"John Smith"}
                                validator={() => { return true}}
                            />
                        </fieldset>
                        <fieldset>
                            <legend className={legendStyles}>Links</legend>
                            <TextItemEditor
                                items={links}
                                setItems={(items) => {
                                    setHasChanged(true)
                                    setLinks(items)
                                }}
                                placeholder={"https://github.com/rmit/cool-app"}
                                validator={(value) => {
                                    return z.validate(z.url(), value)
                                }}
                            />
                        </fieldset>
                        <fieldset>
                            <legend className={legendStyles}>Slugs</legend>
                            <SlugEditor projectId={project.id}/>
                        </fieldset>

                        <div className={`mt-4 flex flex-col gap-2`}>
                            <div className={`flex gap-2`}>
                                <button
                                    type={"button"}
                                    className={`
                                    px-4 py-2 rounded-md text-white
                                    ${detailsTab === "description" ? `bg-r-blue-700` : `bg-r-blue-500 hover:bg-r-blue-700 cursor-pointer`}
                                    `}
                                    onClick={() => setDetailsTab("description")}
                                >
                                    Description
                                </button>
                                <button
                                    type={"button"}
                                    className={`
                                    px-4 py-2 rounded-md text-white
                                    ${detailsTab === "media" ? `bg-r-blue-700` : `bg-r-blue-500 hover:bg-r-blue-700 cursor-pointer`}
                                    `}
                                    onClick={() => setDetailsTab("media")}
                                >
                                    Screenshots
                                </button>
                                <button
                                    type={"button"}
                                    className={`
                                    px-4 py-2 rounded-md text-white
                                    ${detailsTab === "video" ? `bg-r-blue-700` : `bg-r-blue-500 hover:bg-r-blue-700 cursor-pointer`}
                                    `}
                                    onClick={() => setDetailsTab("video")}
                                >
                                    Video
                                </button>
                            </div>
                            {detailsTab === "description" &&
                                <MarkdownEditor
                                    initText={project.description}
                                    setHasChanged={setHasChanged}
                                    markdownRef={descriptionRef}
                                    setDescription={(value) => {
                                        setProject({...project, description: value})
                                    }}
                                />
                            }
                            {detailsTab === "media" &&
                                <MediaEditor
                                    media={project.media.filter(
                                        m => {return m.mediaType === "SCREENSHOT"}
                                    )}
                                    setHasChanged={setHasChanged}
                                    setMedia={updateScreenshots}
                                    project={project}
                                    submitProject={submit}
                                />
                            }
                            {
                                detailsTab === "video" &&
                                <VideoEditor
                                    media={project.media.
                                    filter(m => {return m.mediaType === "VIDEO"}
                                    )}
                                    project={project}
                                />
                            }
                        </div>
                    </form>


                    <button
                        onClick={deleteProject}
                        className={`
                        mt-12 bg-red-700 hover:bg-red-500 text-white rounded-md px-4 py-2 flex gap-2 items-center self-start cursor-pointer
                        `}>
                        <FaTrash /> <span>Delete project</span>
                    </button>
                </div>
            }
        </>
    )
}