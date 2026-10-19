import {useCallback, useEffect, useState} from "react";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import { throwErrorFromResponse } from "../../../utils/misc.ts";
import type {CategoryResponse, CategoryType, ProjectSearchResponse} from "@hapi/shared/types/apiResponses";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {FaSpinner} from "react-icons/fa";
import {CategoryListItem} from "./CategoryListItem.tsx";
import {HeroProjectCard} from "../../../components/HeroProjectCard.tsx";

const NUM_RANDOM_PROJECTS = 4

export function CategoryPage() {
    const modalContext = useModal()
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [categories, setCategories] = useState<CategoryType[]>([])
    const [projects, setProjects] = useState<ProjectPreviewType[]>([])

    const getCategories = useCallback(async () => {
        try {
            setLoadingCategories(true)
            const res = await fetch(`${API_URL}/category`)
            if (!res.ok) {
                await throwErrorFromResponse(res)
            }
            const json: CategoryResponse = await res.json()
            setCategories(json.categories.filter((c) => c.projectCount > 0))
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        } finally {
            setLoadingCategories(false)
        }
    }, [modalContext])

    const getProjects = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/project/search?orderBy=random&limit=${NUM_RANDOM_PROJECTS}`, {
                credentials: "omit"
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            const json: ProjectSearchResponse = await res.json()
            setProjects(json.projects)
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [modalContext])

    useEffect(() => {
        (async () => {
            await Promise.all([
                getCategories(),
                getProjects()
            ])
        })()
    }, [getCategories, getProjects]);

    useEffect(() => {
        if (!document.scrollingElement) return
        document.scrollingElement.scrollTop = 0
    }, []);

    return (
        <div className={`flex flex-col gap-4 items-start`}>
            <div className={`flex items-center gap-2`}>
                <h1 className={`font-headline font-bold text-3xl`}>Categories</h1>
                {loadingCategories && <FaSpinner className={`animate-spin text-xl`} />}
            </div>
            <ul className={`flex flex-wrap gap-2`}>
                {
                    categories && categories.map((category: CategoryType) => {
                        return (
                            <CategoryListItem data={category} key={category.id}/>
                        )
                    })
                }
            </ul>
            {projects && projects.length > 0 &&
                <>
                    <h2 className={`font-bold text-xl mt-12 uppercase`}>Discover more</h2>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                        {
                            projects.map((p) => {
                                return (
                                    <HeroProjectCard key={p.id} project={p}/>
                                )
                            })
                        }
                    </div>
                </>
            }
        </div>
    )
}