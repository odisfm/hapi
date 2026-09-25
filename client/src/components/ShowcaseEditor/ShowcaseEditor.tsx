import {useNavigate, useParams} from "react-router";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ShowcaseAdminType} from "@hapi/shared/types/showcase";
import {API_URL} from "../../consts.ts";
import {useModal} from "../../contexts/modal/useModal.ts";
import type {ShowcaseAdminDetailsResponse} from "@hapi/shared/types/apiResponses";
import {FaSpinner, FaTrash} from "react-icons/fa";
import {SaveButton} from "../generic/SaveButton.tsx";
import {MarkdownEditor} from "../generic/MarkdownEditor.tsx";
import ProjectCard from "../ProjectCard.tsx";
import {format, formatDistance} from "date-fns";
import type {UpdateShowcaseRequestType} from "@hapi/shared/types/apiRequests";

const legendStyles = `font-medium`
const inputStyles = `p-1 rounded-md bg-neutral-200 px-2 py-1 font-light`

export function ShowcaseEditor() {
    const modalContext = useModal()
    const navigate = useNavigate()
    const params = useParams();
    const id = params.showcaseId
    const isNew = params.showcaseId === "new"
    const [showcase, setShowcase] = useState<ShowcaseAdminType | null>(null);
    const [hasChanged, setHasChanged] = useState(false);
    const descriptionRef = useRef<string>("");

    const getShowcase = useCallback(async () => {
        let res: Response;
        try {
            if (!isNew) {
                res = await fetch(`${API_URL}/showcase/${id}`, {
                    credentials: "include"
                });
            } else {
                res = await fetch(`${API_URL}/showcase`, {
                    credentials: "include",
                    method: "POST"
                });
            }

            if(!res.ok) {
                throw new Error(res.statusText);
            }

            const json: ShowcaseAdminDetailsResponse = await res.json();
            setShowcase(json.showcase)

        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Failed to get showcase",
                body: String(e),
                buttons: [{id: "ok", text: "Back to dashboard", variant: "default"}]
            })
            navigate("/dashboard/showcases")
        }
    }, [navigate, modalContext, id, isNew])

    useEffect(() => {
        (async () => {
            await getShowcase();
        })()
    }, [isNew, getShowcase])

    const publishDateText = useMemo(() => {
        if (!showcase) return ""
        if (!showcase.publishedDate) return "No date set. Showcase and projects will not be public until a date is set."
        const now = new Date();
        const sDate = new Date(showcase.publishedDate)
        if (now > sDate) {
            return "Date is in past; showcase and projects will be public immediately."
        }
        return `Showcase and projects will be public in ${formatDistance(now, sDate)}.`

    }, [showcase])

    const updateShowcase = useCallback(async () => {
        if (!showcase) return
        let res: Response;
        try {
            const body = {
                showcase: {
                    ...showcase,

                }
            } satisfies UpdateShowcaseRequestType
            res = await fetch(`${API_URL}/showcase`, {
                credentials: "include",
                method: "PATCH",
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            setHasChanged(false)
            await getShowcase();

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to update showcase",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }

    }, [showcase, modalContext, getShowcase])

    const deleteShowcase = useCallback(async () => {
        if (!showcase) return
        if (showcase.projects.length) {
            return await modalContext.dispatchModal({
                headline: "Can't delete showcase",
                body: `Can't delete showcase while it has projects associated.\nFirst, delete all ${showcase.projects.length} project(s) or reassign them to new showcases.`,
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }
        const confirm = await modalContext.dispatchModal({
            headline: "Delete showcase?",
            body: "Showcase will be deleted immediately and will be unrecoverable",
            buttons: [{id: "cancel", text: "Cancel", variant: "default"}, {id: "confirm", text: "Delete showcase", variant: "danger"}]
        })
        if (confirm !== "confirm") return

        let res: Response;
        try {
            res = await fetch(`${API_URL}/showcase/${showcase.id}`, {
                method: 'DELETE',
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            navigate("/dashboard/showcases")
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Failed to delete showcase",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }


    }, [showcase, modalContext, navigate])

    if (!showcase) {
        return <FaSpinner className={`animate-spin`}/>
    }

    return (
        <div className={`flex flex-col w-full md:w-4/10`}>
            <div className={`flex items-center`}>
                <div className={`flex flex-col gap-1`}>
                    <h2 className={`font-headline text-3xl`}>{showcase.name || "Untitled showcase"}</h2>
                    <span className={`text-xl font-bold`}>
                        {showcase.year > 0 && <span>{showcase.year}</span>}
                        {showcase.semester > 0 && showcase.year > 0 && <span>, Semester {showcase.semester}</span>}
                    </span>
                </div>
            
                <SaveButton onClick={() => {updateShowcase()}} hasChanged={hasChanged} />
            </div>

            <form className={`mt-6 flex flex-col gap-4`}>
                <fieldset>
                    <legend className={legendStyles}>Showcase name</legend>
                    <input
                        className={`${inputStyles} w-2/3`}
                        defaultValue={showcase.name}
                        onChange={e => {
                            if (!showcase) return
                            setShowcase({...showcase, name: e.target.value || ""})
                            setHasChanged(true)
                        }}
                    />
                </fieldset>
                <fieldset>
                    <legend className={legendStyles}>Year</legend>
                    <input
                        className={inputStyles}
                        type={"number"}
                        defaultValue={showcase.year}
                        min={0}
                        onChange={e => {
                            if (!showcase) return
                            setShowcase({...showcase, year: isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)})
                            setHasChanged(true)
                        }}
                    />
                    <span className={`block text-sm font-thin mt-2`}>If showcase shouldn't be tied to a particular year, enter "0"</span>
                </fieldset>
                <fieldset>
                    <legend className={legendStyles}>Semester</legend>
                    <input
                        className={inputStyles}
                        type={"number"}
                        defaultValue={showcase.semester}
                        min={0}
                        onChange={e => {
                            if (!showcase) return
                            setShowcase({...showcase, semester: isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)})
                            setHasChanged(true)
                        }}
                    />
                    <span className={`block text-sm font-thin mt-2`}>If showcase shouldn't be tied to a semester year, enter "0"</span>
                </fieldset>

                <fieldset>
                    <legend className={legendStyles}>Publish date</legend>
                    <input
                        className={inputStyles}
                        type={"datetime-local"}
                        defaultValue={showcase.publishedDate ? format(new Date(showcase.publishedDate), "yyyy-MM-dd'T'HH:mm") : ""}
                        min={0}
                        onChange={e => {
                            if (!showcase) return
                            setShowcase({...showcase, publishedDate: e.target.value ? new Date(e.target.value) : null})
                            setHasChanged(true)
                        }}
                    />
                    <span className={`block text-sm font-thin mt-2`}>{publishDateText}</span>
                </fieldset>

                <fieldset>
                    <legend className={legendStyles}>Description</legend>
                    <MarkdownEditor
                    initText={showcase.description || ""}
                    setHasChanged={setHasChanged}
                    markdownRef={descriptionRef}
                    setDescription={(value) => {
                        setShowcase({...showcase, description: value})
                    }}
                    containerStyles={`self-start`}
                /></fieldset>
            </form>

            <h3 className={`mt-6 font-bold`}>PROJECTS</h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {showcase.projects.length === 0 && <span>None yet</span>}
                {showcase.projects.map(project => (
                    <button
                        key={project.id}
                        className={`text-left`}
                        onClick={() => {window.open(`/dashboard/project/${project.id}`)}}
                    >
                        <div className={`pointer-events-none`}>
                            <ProjectCard name={project.name}
                                         iconUrl={project.iconUrl}
                                         subtitle={project.subtitle}
                                        slug={project.slug}
                            />
                        </div>
                    </button>
                ))}
            </div>

            <button
                className={`mt-12 self-start rounded-md px-4 py-2 bg-red-700 hover:bg-red-600 text-white cursor-pointer flex gap-2 items-center`}
                onClick={() => {deleteShowcase()}}
            >
                <FaTrash />
                <span>Delete showcase</span>
            </button>
        </div>
    )
}