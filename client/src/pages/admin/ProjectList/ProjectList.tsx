import type {ProjectSearchQuery, ProjectSearchSortStrategy} from "@hapi/shared/types/apiRequests";
import {useCallback, useEffect, useMemo, useState} from "react";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {API_URL} from "../../../consts.ts";
import type {
    CategoryResponse,
    ProjectSearchResponse,
    SearchInfo,
    ShowcaseListResponse
} from "@hapi/shared/types/apiResponses";
import {ProjectListItem} from "./ProjectListItem.tsx";
import {Paginator} from "../ProjectEditor/Paginator.tsx";
import {FaPlus, FaSearch} from "react-icons/fa";
import type {Category} from "@hapi/shared/prisma/client";
import {FilterSection} from "./FilterSection.tsx";
import {SearchBar} from "./SearchBar.tsx";
import {toApiSearchParams, useProjectSearchParams} from "../../../hooks/useProjectSearchParams.ts";
import {Link} from "react-router";
import {SearchOrderPicker} from "../../public/SearchResultsPage/SearchOrderPicker.tsx";
import {Spinner} from "../../../components/generic/Spinner.tsx";

const PAGE_LIMIT = 15;

export function ProjectList() {
    const [urlQuery, updateQuery] = useProjectSearchParams();
    const [projects, setProjects] = useState<ProjectPreviewType[]>([])
    const [searchResultInfo, setSearchResultInfo] = useState<SearchInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showcases, setShowcases] = useState<ShowcaseListResponse["showcases"]>([]);
    const [sortStrategy, setSortStrategy] = useState<ProjectSearchSortStrategy>(urlQuery.orderBy || "default")

    const pageNumber = urlQuery.page ?? 0;
    const searchQuery: ProjectSearchQuery = useMemo(() => ({...urlQuery, limit: PAGE_LIMIT}), [urlQuery]);

    const _setSortStrategy = useCallback((strategy: ProjectSearchSortStrategy) => {
        updateQuery({
            orderBy: strategy
        })
        setSortStrategy(strategy);
    }, [updateQuery])

    useEffect(() => {
        let ignore = false;
        (async () => {
                setLoading(true);
                let res: Response
                try {
                    res = await fetch(`${API_URL}/project/search?${toApiSearchParams(searchQuery)}`, {
                        credentials: "include",
                    })
                    if (!res.ok) {
                        console.error(res)
                        throw new Error("Failed to get projects")
                    }
                    const json: ProjectSearchResponse = await res.json()
                    if (ignore) return
                    setProjects(json.projects)
                    setSearchResultInfo(json.info)
                } catch (e) {
                    console.error(e) // todo
                }
                if (ignore) return
                setLoading(false)
                setInitialLoading(false)
            }
        )()
        return () => {
            ignore = true
        }
    }, [searchQuery])

    useEffect(() => {
        (async () => {
            let res: Response
            try {
                res = await fetch(`${API_URL}/category`, {credentials: "include"})
                if (!res.ok) {
                    console.error(res)
                    throw new Error("Failed to get category")
                }
                const json: CategoryResponse = await res.json()
                setCategories(json.categories)
            } catch (e) {
                console.error(e)
            }
        })()
    }, []);

    useEffect(() => {
        (async () => {
            let res: Response
            try {
                res = await fetch(`${API_URL}/showcase/all`, {credentials: "include"})
                if (!res.ok) {
                    console.error(res)
                    throw new Error("Failed to get showcases")
                }
                const json: ShowcaseListResponse = await res.json()
                setShowcases(json.showcases)
            } catch (e) {
                console.error(e)
            }
        })()
    }, []);

    const resultNumbers: number[] = useMemo(() => {
        if (!searchResultInfo || !projects) return [0, 0]
        const lowerBound = PAGE_LIMIT * pageNumber + 1
        const upperBound = Math.min((PAGE_LIMIT * pageNumber) + PAGE_LIMIT, searchResultInfo.totalResults)
        return [lowerBound, upperBound]
    }, [pageNumber, searchResultInfo, projects])

    const pageCount: number = useMemo(() => {
        if (!projects) return 0
        if (!searchResultInfo?.totalResults) return 0
        return Math.ceil(searchResultInfo.totalResults / PAGE_LIMIT)
    }, [searchResultInfo, projects])

    function setPageNumber(page: number): void {
        updateQuery({page})
    }

    let resultsText: string
    if (searchResultInfo?.totalResults === undefined) {
        resultsText = ""
    }
    else if (searchResultInfo.totalResults === 0) {
        resultsText = "No projects matching filters."
    } else {
        if (searchResultInfo.totalResults === 1) {
            resultsText = "1 project matching filters."
        } else {
            if (searchResultInfo.totalResults <= PAGE_LIMIT) {
                resultsText = `${searchResultInfo.totalResults} projects found.`
            } else {
                resultsText = `${searchResultInfo.totalResults} projects found, showing ${resultNumbers[0]}-${resultNumbers[1]}.`
            }
        }
    }

    return (
        <div className={`flex flex-col gap-4 w-full`}>

            <div className={`flex items-center`}>
                <div className={`flex gap-2 items-center`}>
                    <h2 className={`font-bold text-3xl`}>PROJECTS</h2>
                    {loading && <Spinner />}
                </div>

                <Link to={`/dashboard/project/new`} className={`
                ml-auto rounded-lg bg-r-red hover:bg-r-yellow-500 text-white hover:text-black transition-colors px-4 py-2 cursor-pointer
                font-bold flex items-center gap-2
                `}>
                    <FaPlus /> <span>New project</span>
                </Link>
            </div>
            <span>{loading ? "Loading..." : resultsText}</span>

            <SearchBar/>
            <Paginator pageCount={pageCount} activePage={pageNumber} setPage={setPageNumber}/>
            <div className={`flex w-full`}>
                <div className={`ml-auto`}>
                    <SearchOrderPicker
                        activeStrategy={sortStrategy}
                        strategies={[
                            "default", "popular",
                            "nameAsc", "nameDesc", "dateDesc", "dateAsc"
                        ]}
                        fn={(s) => {
                            _setSortStrategy(s)
                        }}
                    /></div>
            </div>
            <div className={`flex flex-col md:flex-row gap-2`}>
                <FilterSection
                    filters={["showcase", "category", "published"]}
                    categories={categories}
                    showcases={showcases}
                    showTitle
                />
                <div className={`flex-1`}>
                    { initialLoading === false && projects.length > 0 ?
                        <ul>
                            {projects.map((project: ProjectPreviewType) => (
                                <ProjectListItem key={project.id} project={project}/>
                            ))}
                        </ul>
                        :
                        <div className={`flex flex-col gap-8 items-center mt-12`}>
                            <FaSearch size={80} />
                            <span>No projects matching filters.</span>
                        </div>
                    }
                </div>
            </div>
            <Paginator pageCount={pageCount} activePage={pageNumber} setPage={setPageNumber}/>

        </div>
    )
}