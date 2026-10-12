import {useParams} from "react-router";
import {useCallback, useEffect, useState} from "react";
import {API_URL} from "../consts.ts";
import type {ShowcasePublicDetailsResponse} from "@hapi/shared/types/apiResponses";
import type {ShowcaseType} from "@hapi/shared/types/showcase";
import Markdown from "react-markdown";
import {FaSpinner} from "react-icons/fa";
import ProjectCard from "../components/ProjectCard.tsx";
import {Error404} from "./Error404.tsx";

export function ShowcasePage() {
    const [showcase, setShowcase] = useState<ShowcaseType | null>(null)
    const [loading, setLoading] = useState(true)
    const {showcaseSlug} = useParams()

    const getShowcase = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/showcase/${showcaseSlug}`)
            if (!res.ok) {
                // todo:
                console.error(res)
                return
            }
            const json: ShowcasePublicDetailsResponse = await res.json()
            console.log(json.showcase)
            setShowcase(json.showcase)
        } catch (e) {
            // todo:
            console.error(e)
            setShowcase(null)
        } finally {
            setLoading(false)
        }
    }, [showcaseSlug])

    useEffect(() => {
        (() => {
            getShowcase()
        })()
    }, [getShowcase])

    if (!loading && !showcase) {
        return <Error404 />
    }

    if (loading || !showcase) {
        return <FaSpinner size={30} className={`animate-spin`}/>
    }

    return (
        <div className={`flex flex-col p-4 md:p-12 w-full lg:w-4/5`}>
            <div className={`
                ${showcase.description ? "grid" : ""} grid-rows-auto grid-cols-1 md:grid-rows-1 md:grid-cols-2 
                gap-2 md:gap-12 md:grid-cols-[300px_300px]
                `}>
                <div className={`
                    flex flex-col items-start text-left gap-4 
                    ${showcase.description && `md:items-end md:text-right`} 
                `}>
                    <h1 className={`text-5xl font-headline`}>
                        {showcase.name}{showcase.year && ` ${showcase.year}`}
                    </h1>
                    {
                        (showcase.year && showcase.semester) ?
                            <>
                                <h2 className={`font-bold uppercase text-lg`}>Semester {showcase.semester}</h2>
                            </>
                            :
                            null
                    }
                </div>
                {
                    showcase.description &&
                    <div className={`showcase-description`}>
                        <Markdown>
                            {showcase.description}
                        </Markdown>
                    </div>
                }
            </div>

            <h3 className={`font-bold text-xl mt-6`}>PROJECTS</h3>

            <div className={`mt-6 grid grid-cols-1 md:grid-cols-3 gap-6`}>
                {showcase.projects.map((p) => {
                    return <ProjectCard name={p.name} iconUrl={p.iconUrl} slug={p.slug} subtitle={p.subtitle} />
                })}
            </div>
        </div>
    )
}