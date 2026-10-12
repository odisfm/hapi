import * as z from "zod"
import {MarkdownEditor} from "../generic/MarkdownEditor.tsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useBlocker, useNavigate, useParams} from "react-router";
import type {ProjectAdminType, ProjectStudentType} from "@hapi/shared/types/project";
import {API_URL} from "../../consts.ts";
import type {
    CategoryResponse, CreateProjectHeroArtResponse, CreateProjectResponse,
    ProjectDetailsAdminResponse,
    ShowcaseListResponse
} from "@hapi/shared/types/apiResponses";
import type {Category, Showcase} from "@hapi/shared/prisma/client";
import {TextItemEditor} from "./TextItemEditor.tsx";
import {formatDate, formatDistance} from "date-fns";
import {FaSpinner, FaTrash, FaUpload} from "react-icons/fa";
import {
    type CreateProjectHeroArtRequestType,
    UpdateProjectRequestSchema,
    type UpdateProjectRequestType
} from "@hapi/shared/types/apiRequests";
import {useModal} from "../../contexts/modal/useModal.ts";
import {MediaEditor} from "./MediaEditor/MediaEditor.tsx";
import {RiImageUploadFill} from "react-icons/ri";
import ProjectCard from "../ProjectCard.tsx";
import {SlugEditor} from "./SlugEditor.tsx";
import {SaveButton} from "../generic/SaveButton.tsx";
import { VideoEditor } from "./VideoEditor.tsx";
import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";
import {Button} from "../generic/Button.tsx";
import {HeroProjectCard} from "../HeroProjectCard.tsx";
import {CategoryPicker} from "./CategoryPicker.tsx";
import {useAuth} from "../../contexts/auth/useAuth.ts";

const legendStyles = `font-medium`
const inputStyles = `p-1 rounded-md bg-neutral-200 px-2 py-1 font-light`
const selectStyles = inputStyles + ``

type ShowcaseListItem = {
    name: string,
    id: string,
    date: Date | null
}

type DetailsTab = "description" | "media" | "video" | "hero"


export function ProjectEditor() {
    const navigate = useNavigate();
    const authContext = useAuth()
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<ProjectStudentType | ProjectAdminType | null>(null);
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
    const rejectionRef = useRef<string>("");
    const [rejectionReason, setRejectionReason] = useState<string>("");
    const isNewProject = projectId === "new";
    const modalContext = useModal();
    const [detailsTab, setDetailsTab] = useState<DetailsTab>("description");
    const iconUploadRef = useRef<HTMLInputElement | null>(null);
    const heroUploadRef = useRef<HTMLInputElement | null>(null);
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanged && currentLocation.pathname !== nextLocation.pathname
    );
    const [approvalStatus, setApprovalStatus] = useState<null | "approved" | "rejected">(null)

    if (!authContext.user && !authContext.authPending) {
        navigate("/admin-login")
    }

    useEffect(() => {
        if (!document.scrollingElement) return
        document.scrollingElement.scrollTop = 0
    }, []);

    const createNewProject = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/project`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({})
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }

            const json: CreateProjectResponse = await res.json();
            if (authContext.user!.role === "ADMIN") {
                navigate(`/dashboard/project/${json.versionId}`)
            } else if (authContext.user!.role === "STUDENT") {
                navigate(`/student/project/${json.versionId}`)
            }

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to create new project",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
            return
        }
    }, [modalContext, navigate, authContext.user])

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
            if (isNewProject) {
                createNewProject();
                return
            }
           await getProject();
        })()

    }, [projectId, getProject, createNewProject, isNewProject]);

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
        if (!selectedShowcase || !project || authContext.user?.role !== "ADMIN") return ""
        if (!(project as ProjectAdminType).published) return "Project will not be published until status changed."
        if (!selectedShowcase.publishedDate) return "Showcase has no publish date."
        let friendlyDate = "Project will be published with showcase "
        const date = new Date(selectedShowcase.publishedDate)
        const now = new Date()
        if (now > date) return "Showcase is published. Project will be live immediately."
        friendlyDate += `in ${formatDistance(date, now)}`
        return `${friendlyDate}. (${formatDate(date, "HH:mm dd/M/yyyy")})`
    }, [selectedShowcase, project, authContext.user])

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
        console.log({submitProject})
        try {
            update = {
                ...( authContext.user!.role === "ADMIN" && {
                    project: {
                        id: submitProject.id,
                        showcaseId: selectedShowcase!.id,
                        published: (submitProject as ProjectAdminType).published,

                }}),
                projectVersion: {
                    id: submitProject.versionId,
                    name: projectName,
                    subtitle: subtitle,
                    description: submitProject.description,
                    iconUrl: submitProject.iconUrl,
                    developerNames: developers,
                    links: links,
                    heroArtUrl: submitProject.heroArtUrl,
                    categoryIds: submitProject.categories.map((cName => {
                        return categories.find((c) => c.name === cName)!.id
                    })),
                    media: submitProject.media,
                }

            } satisfies UpdateProjectRequestType
            UpdateProjectRequestSchema.parse(update)
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
            await getProject()

        } catch (e) {
            console.error(e)
        }
    }, [authContext.user, getProject, project, categories, projectName, subtitle, developers, links, selectedShowcase])

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
                await submit(newProject as ProjectAdminType)
            }

        } catch (e) {
            await modalContext.dispatchModal({
                headline: "Failed to upload icon",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }

    }, [project, submit, modalContext])

    const uploadHeroArt = useCallback(async (e: React.ChangeEvent) => {
        if (!project) return
        const input = e.target as HTMLInputElement
        if (!input.files?.length) return
        const file = input.files[0]!
        const formData = new FormData()
        formData.append('file', file)
        formData.append("data", JSON.stringify({
            projectId: project.id,
        } satisfies CreateProjectHeroArtRequestType))

        let res: Response
        try {
            res = await fetch(`${API_URL}/media/hero`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })
            if (!res.ok) {
                console.error(res)
                throw new Error("Failed to upload image")
            }
            const json: CreateProjectHeroArtResponse = await res.json()

            setProject({
                ...project,
                heroArtUrl: json.uri
            })
            setHasChanged(true)

        } catch (e) {
            console.error(e) // todo
        }
    }, [project])

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
        const newProject = {
            ...project,
            media: [...videos, ...newScreenshots]

        }
        console.log({newProject})
        setProject(newProject)
    }, [project])

    const submitForApproval = useCallback(async () => {
        try {
            if (!project) return
            await submit()
            const res = await fetch(`${API_URL}/project/version/${project.versionId}/status`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify({
                    status: "PENDING"
                })
            })
            if (!res.ok) {
                console.error(res)
            }
            navigate("/student")
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to submit",
                body: String(e),
            })
        }
    }, [project, submit, modalContext, navigate])

    const submitApproval = useCallback(async () => {
        if (!project) return
        if (approvalStatus === null) return
        if (approvalStatus === "rejected" && !rejectionReason) {
            return await modalContext.dispatchModal({
                headline: "Missing rejection reason",
                body: "Enter rejection reason to send student feedback before rejecting"
            })
        }
        try {
            const res = await fetch(`${API_URL}/project/version/${project.versionId}/status`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify({
                    status: approvalStatus === "rejected" ? "REJECTED" : "APPROVED",
                    ...(approvalStatus === "rejected" && {rejectionReason: rejectionReason})
                })
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            navigate("/dashboard/project-queue")
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to submit",
                body: String(e),
            })
        }
    }, [modalContext, approvalStatus, project, navigate, rejectionReason])

    if (loading) return (
        <>
            <FaSpinner className={`animate-spin`}/>
        </>
    )

    return (
        <>
            { project && categories.length &&
                <div className={"flex flex-col gap-2 w-full md:w-4/5 lg:w-2/3 xl:w-3/5 2xl:w-2/5 mt-8"}>
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
                                        <button aria-label="Upload project icon" className={`
                                            bg-r-yellow-500 hover:bg-r-yellow-400 cursor-pointer
                                            flex items-center gap-2 p-3 rounded-full
                                            `}
                                            onClick={() => {
                                                iconUploadRef.current!.click()
                                            }}
                                        >
                                            <RiImageUploadFill />
                                        </button>
                                        <SaveButton onClick={async () => { console.log("editor onClick"); await submit() }} hasChanged={hasChanged} />
                                    </div>
                            </form>
                        </div>

                    </div>
                    <form
                        className={`flex flex-col gap-4 mt-4 project-editor-form`}
                        onSubmit={(e) => {
                            e.preventDefault()
                            submit()
                        }}
                    >
                        <div>
                            <label
                                className={legendStyles}
                                htmlFor={"projectNameInput"}
                            >
                                Project name
                            </label>
                            <input
                                id={"projectNameInput"}
                                aria-label="Project name"
                                defaultValue={projectName}
                                onChange={(e) => {
                                    setHasChanged(true)
                                    setProjectName(e.target.value)
                                }}
                                className={`${inputStyles} w-full`}
                                required
                            />
                        </div>
                        <div>
                            <label
                                className={legendStyles}
                                htmlFor={"subtitleInput"}
                            >
                                Subtitle
                            </label>
                            <input
                                name={"subtitle"}
                                id={"subtitleInput"}
                                defaultValue={subtitle}
                                onChange={(e) => {
                                    setHasChanged(true)
                                    setSubtitle(e.target.value)
                                }}
                                className={`${inputStyles} w-full`}
                                required
                            />
                        </div>

                        <fieldset>
                            <legend className={legendStyles}>Categories</legend>
                            <CategoryPicker
                                categories={categories}
                                project={project as ProjectAdminType}
                                setProject={setProject}
                                setHasChanged={setHasChanged}
                            />
                        </fieldset>
                        <div>
                            <label className={legendStyles} id={"developersLabel"}>
                                Developers
                            </label>
                            <TextItemEditor
                                items={developers}
                                setItems={(items) => {
                                    setHasChanged(true)
                                    setDevelopers(items)
                                }}
                                placeholder={"John Smith"}
                                validator={() => { return true}}
                            />
                        </div>
                        <div>
                            <label className={legendStyles}>Links</label>
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
                        </div>

                        {
                            authContext.user?.role === "ADMIN" &&
                            <div className={`flex flex-col gap-4 p-4 rounded-sm bg-r-blue-300/40`}>
                                <h3 className={`text-xl`}>Admin-only fields</h3>
                                <span>These fields cannot be viewed or edited by students.</span>

                                {showcaseItems.length > 0 &&
                                    <>
                                        <div className={`flex flex-col gap-2`}>
                                            <label
                                                className={legendStyles}
                                                htmlFor={"showcaseInput"}
                                            >
                                                Showcase
                                            </label>
                                            <select
                                                name={"showcase"}
                                                id={"showcaseInput"}
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
                                        </div>
                                    </>
                                }
                                <div>
                                    <label className={legendStyles}>Status</label>
                                    <div className={`flex gap-2 items-center`}>
                                        <input
                                            name={"published"}
                                            id={"publishedTrue"}
                                            type={"radio"}
                                            value={1}
                                            checked={(project as ProjectAdminType).published}
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
                                            checked={!(project as ProjectAdminType).published}
                                            onChange={() => {
                                                setProject({
                                                    ...project,
                                                    published: false
                                                })
                                                setHasChanged(true)
                                            }}
                                            required
                                        />
                                        <label htmlFor={"publishedFalse"} className={`font-light`}>Unpublished</label>
                                    </div>
                                </div>
                                {showcaseDate &&
                                    <span className={`text-xs`}>
                                    {showcaseDate.split("(")[0]}
                                        {showcaseDate.includes("(") &&
                                            <span
                                                className={`font-bold text-xs`}>
                                                {showcaseDate.split("(")[1].slice(0, -1)}
                                            </span>
                                        }
                                    </span>
                                }

                                <div>
                                    <label className={legendStyles} id={"slugsLabel"} htmlFor={"slugsEditor"}>Slugs</label>
                                    <SlugEditor projectId={project.id}/>
                                </div>
                            </div>
                        }

                        <div className={`mt-4 flex flex-col gap-2`}>
                            <div className={`flex gap-2`}>
                                <Button
                                    buttonType={"button"}
                                    color={detailsTab === "description" ? "blue" : "light-blue"}
                                    active={detailsTab === "description"}
                                    onClick={() => setDetailsTab("description")}
                                    ariaLabel={"Enable description view"}
                                >
                                    Description
                                </Button>
                                <Button
                                    buttonType={"button"}
                                    color={detailsTab === "media" ? "blue" : "light-blue"}
                                    active={detailsTab === "media"}
                                    onClick={() => setDetailsTab("media")}
                                    ariaLabel={"Enable screenshots view"}
                                >
                                    Screenshots
                                </Button>
                                <Button
                                    buttonType={"button"}
                                    color={detailsTab === "hero" ? "blue" : "light-blue"}
                                    active={detailsTab === "hero"}
                                    onClick={() => setDetailsTab("hero")}
                                    ariaLabel={"Enable hero art view"}
                                >
                                    Hero art
                                </Button>
                                <Button
                                    buttonType={"button"}
                                    color={detailsTab === "video" ? "blue" : "light-blue"}
                                    active={detailsTab === "video"}
                                    onClick={() => setDetailsTab("video")}
                                    ariaLabel={"Enable video view"}
                                >
                                    Video
                                </Button>
                            </div>
                            {detailsTab === "description" &&
                                <MarkdownEditor
                                    initText={project.description}
                                    setHasChanged={setHasChanged}
                                    markdownRef={descriptionRef}
                                    setDescription={(value) => {
                                        setProject({...project, description: value})
                                    }}
                                    containerStyles={`w-full`}
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
                                    submitProject={() => submit(project as ProjectAdminType)}
                                />
                            }
                            {
                                detailsTab === "hero" &&
                                <div className="flex flex-col gap-2 mt-6">
                                    {
                                        !project.heroArtUrl &&
                                        <p className={`p-4 rounded-md bg-red-700/20`}>
                                            No hero art for this project yet.
                                        </p>
                                    }
                                    <Button
                                        styles={`self-start`}
                                        onClick={() => {
                                            if (!heroUploadRef.current) return
                                            heroUploadRef.current.click()
                                        }}
                                    >
                                        <FaUpload />
                                        {project.heroArtUrl ? "Replace hero art" : "Upload hero art"}
                                    </Button>
                                    <input
                                        ref={heroUploadRef}
                                        onChange={(e) => uploadHeroArt(e)}
                                        type={"file"}
                                        accept={".png,.jpg,.jpeg,.tiff,.svg,.webp,.heif"}
                                        name={"iconInput"}
                                        className={'hidden'}
                                    />
                                    <div className={`max-w-[300px]`}>
                                        <HeroProjectCard project={project}/>
                                    </div>
                                    <div className={`max-w-[640px]`}>
                                        <HeroProjectCard project={project} />
                                    </div>
                                </div>
                            }
                            {
                                detailsTab === "video" &&
                                <VideoEditor
                                    media={project.media.
                                    filter(m => {return m.mediaType === "VIDEO"}
                                    )}
                                    project={project as ProjectAdminType}
                                />
                            }
                        </div>
                    </form>


                    {
                        authContext.user?.role === "ADMIN" &&
                        <>
                            { project.submissionStatus === "PENDING" &&
                                <>
                                    <h3 className={`font-bold text-xl mt-6`}>Review submission</h3>
                                    <div className={`flex gap-2 items-center`}>
                                        <select
                                            className={`${selectStyles} pr-4`}
                                            onChange={(e) =>
                                                setApprovalStatus(e.target.value as "approved" | "rejected")
                                        }>
                                            <option value={""} selected disabled hidden>---</option>
                                            <option value={"approved"}>
                                                Approved
                                            </option>
                                            <option value={"rejected"}>
                                                Rejected
                                            </option>
                                        </select>
                                    </div>

                                    <Button
                                        styles={`self-start min-w-30`}
                                        disabled={approvalStatus === null}
                                        onClick={submitApproval}
                                        color={(() => {
                                            switch (approvalStatus) {
                                                case "approved":
                                                    return "blue"
                                                case "rejected":
                                                    return "danger"
                                                case null:
                                                    return "grey"
                                            }
                                        })()}
                                    >
                                        {(() => {
                                            switch (approvalStatus) {
                                                case "approved":
                                                    return "Approve"
                                                case "rejected":
                                                    return "Reject"
                                                case null:
                                                    return "Submit approval"
                                            }
                                        })()}
                                    </Button>

                                    {approvalStatus === "rejected" &&
                                        <>
                                            <span className={`mt-6 font-bold text-lg`}>Rejection reason</span>
                                            <MarkdownEditor
                                                containerStyles={`self-start`}
                                                initText={""}
                                                setHasChanged={() => {
                                                }}
                                                markdownRef={rejectionRef}
                                                setDescription={setRejectionReason}
                                            />
                                        </>

                                    }
                                </>
                            }

                            <Button
                                onClick={deleteProject}
                                color={"danger"}
                                styles={`self-end mt-12`}
                            >
                                <FaTrash/> <span>Delete project</span>
                            </Button>

                        </>
                    }
                    {
                        authContext.user?.role === "STUDENT" &&
                        <Button
                            styles={`self-start`}
                            color={"yellow"}
                            onClick={submitForApproval}
                        >
                            Submit for approval
                        </Button>
                    }
                </div>
            }
        </>
    )
}