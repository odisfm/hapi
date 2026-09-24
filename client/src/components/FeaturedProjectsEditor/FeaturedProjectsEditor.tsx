import ProjectCard from "../ProjectCard.tsx";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {useCallback, useEffect, useMemo, useState} from "react";
import {API_URL} from "../../consts.ts";
import {useModal} from "../../contexts/modal/useModal.ts";
import type {ProjectSearchResponse} from "@hapi/shared/types/apiResponses";
import {sortByLexorank} from "@hapi/shared/utils/sortByLexoRank";
import {ProjectListItem} from "./ProjectListItem.tsx";
import {ProjectList} from "./ProjectList.tsx";
import {LexoRank} from "@dalet-oss/lexorank";
import {SaveButton} from "../generic/SaveButton.tsx";

const h3Styles = "font-copy text-2xl font-bold leading-[1.3] tracking-normal"

export function FeaturedProjectsEditor() {
    const modalContext = useModal()
    const [allProjects, setAllProjects] = useState<ProjectPreviewType[]>([])
    const [alteredProjects, setAlteredProjects] = useState<string[]>([])

    const getProjects = useCallback(async () => {
        let res: Response
        try {
            res = await fetch(`${API_URL}/project/search?limit=100000&published=published`)
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            const json: ProjectSearchResponse = await res.json()
            setAllProjects(json.projects)
        } catch (e) {
            console.error(e)
            return await modalContext.dispatchModal({
                headline: "Failed to get featured projects",
                body: String(e),
                buttons: [{id: "", text: "Ok", variant: "default"}]
            })
        }
    }, [modalContext])

    const batchUpdateProjects = useCallback(async () => {
        const updates = []
        for (const id of alteredProjects) {
            const project = allProjects.find((project) => project.id === id)
            updates.push({
                id: project!.id,
                featured: project!.featured,
                order: project!.order
            })
        }

        let res: Response
        try {
            res = await fetch(`${API_URL}/project/batch`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify({projects: updates})
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            setAlteredProjects([])
            await getProjects()

        } catch (e) {
            console.error(e)
            return await modalContext.dispatchModal({
                headline: "Failed to save changes",
                body: String(e),
                buttons: [{id: "", text: "Ok", variant: "default"}]
            })
        }

    }, [allProjects, alteredProjects, modalContext, getProjects])

    useEffect(() => {
        (async () => {
            await getProjects()
        })()
    }, [getProjects])

    const {featuredProjectList, nonFeaturedProjectList} = useMemo(() => {
        let featuredProjectList: ProjectPreviewType[] = []
        const nonFeaturedProjectList: ProjectPreviewType[] = []

        for (const project of allProjects) {
            if (project.featured) {
                featuredProjectList.push(project)
            } else {
                nonFeaturedProjectList.push(project)
            }
        }

        featuredProjectList =
            featuredProjectList.sort((a, b) => {
                return sortByLexorank(a, b)
            })

        return {featuredProjectList, nonFeaturedProjectList}
    }, [allProjects])

    const toggleFeaturedProject = useCallback((id: string) => {
        const projectIdx = allProjects.findIndex((project) => project.id === id)
        if (projectIdx === -1) return // can't happen
        const project = allProjects[projectIdx]
        setAllProjects([...allProjects.toSpliced(projectIdx, 1), {...project, featured: !project.featured}])
        if (!alteredProjects.includes(project.id)) {
            setAlteredProjects([...alteredProjects, project.id])
        }


    }, [allProjects, alteredProjects])

    const reorderFeatured = useCallback((sourceIndex: number, targetIndex: number) => {
        if (sourceIndex === targetIndex) return

        const sourceProject = featuredProjectList[sourceIndex]
        const targetProject = featuredProjectList[targetIndex]
        if (!sourceProject || !targetProject) return

        const targetRank = LexoRank.parse(targetProject.order)
        let newRank: LexoRank

        if (sourceIndex < targetIndex) {
            const after = featuredProjectList[targetIndex + 1]
            newRank = after ? targetRank.between(LexoRank.parse(after.order)) : targetRank.genNext()
        } else {
            const before = featuredProjectList[targetIndex - 1]
            newRank = before ? LexoRank.parse(before.order).between(targetRank) : targetRank.genPrev()
        }

        const newOrder = newRank.toString()

        setAllProjects(prev =>
            prev.map(p => (p.id === sourceProject.id ? { ...p, order: newOrder } : p))
        )
        setAlteredProjects(prev =>
            prev.includes(sourceProject.id) ? prev : [...prev, sourceProject.id]
        )
    }, [featuredProjectList])

    return (
        <div className={`flex flex-col gap-2 items-start`}>

            <div className={`flex items-center gap-6`}>
                <h3
                    className={`font-bold text-3xl`}
                >
                    FEATURED PROJECTS
                </h3>
                <SaveButton onClick={() => {batchUpdateProjects()}} hasChanged={alteredProjects.length > 0} styles={``} />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 self-center isolate md:min-w-250">
                {featuredProjectList.map((p) => {
                    return (
                        <ProjectCard name={p.name} iconUrl={p.iconUrl} slug={p.slug} subtitle={p.subtitle} />
                    )
                })}
            </div>

            <h3 className={h3Styles}>PROJECTS</h3>
            <h4 className={`font-bold`}>FEATURED</h4>
            <span className={`font-thin`}>Drag and drop to reorder</span>
            <ProjectList reorder={reorderFeatured}>
                {featuredProjectList.map((p, i) => {
                    return (
                        <ProjectListItem
                            name={p.name}
                            projectId={p.id}
                            slug={p.slug}
                            iconUrl={p.iconUrl}
                            featured={true}
                            toggleFeatured={toggleFeaturedProject}
                            index={i}
                        />
                    )
                })}
            </ProjectList>
            <h4 className={`font-bold`}>NOT FEATURED</h4>
            <span className={`font-thin`}>Click heart to feature. Only showing published projects.</span>
            <ProjectList reorder={reorderFeatured}>
                {nonFeaturedProjectList.map((p, i) => {
                    return (
                        <ProjectListItem
                            name={p.name}
                            projectId={p.id}
                            slug={p.slug}
                            iconUrl={p.iconUrl}
                            featured={false}
                            toggleFeatured={toggleFeaturedProject}
                            index={i}
                        />
                    )
                })}
            </ProjectList>
        </div>
    )
}