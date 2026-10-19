import type {ProjectSearchQuery, ProjectSearchSortStrategy} from "@hapi/shared/types/apiRequests";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {API_URL} from "../../../consts.ts";
import type {
    CategoryResponse,
    ProjectSearchResponse,
    SearchInfo,
    ShowcaseListResponse
} from "@hapi/shared/types/apiResponses";
import type {Category, Showcase} from "@hapi/shared/prisma/client";
import ProjectCard from "../../../components/ProjectCard.tsx";
import {Paginator} from "../../admin/ProjectEditor/Paginator.tsx";
import {FilterSection} from "../../admin/ProjectList/FilterSection.tsx";
import {SearchBar} from "../../admin/ProjectList/SearchBar.tsx";
import {
    splitList,
    toApiSearchParams,
    useProjectSearchParams
} from "../../../hooks/useProjectSearchParams.ts";
import {getShowcaseName} from "@hapi/shared/utils/getShowcaseName";
import {SearchOrderPicker} from "./SearchOrderPicker.tsx";
import {Spinner} from "../../../components/generic/Spinner.tsx";
import { FaSearch } from "react-icons/fa";

/** Fewer results per page with the filter panel open, so the 2-column grid has no gap. */
function pageLimit(filtersOpen: boolean): number {
    return filtersOpen ? 14 : 15;
}

/**
 * Index of the first result the user is looking at. Kept across filter-panel toggles so
 * flipping between 14 and 15 per page doesn't drift; recomputed once they move to another page.
 */
function anchorIndexFor(anchorIndex: number, page: number, limit: number): number {
    return Math.floor(anchorIndex / limit) === page ? anchorIndex : page * limit;
}

export default function SearchResultsPage() {
    const [urlQuery, updateQuery] = useProjectSearchParams();
    const [projects, setProjects] = useState<ProjectPreviewType[]>([])
    const [searchResultInfo, setSearchResultInfo] = useState<SearchInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showcases, setShowcases] = useState<Showcase[]>([]);
    // start open when arriving with filters already in the URL, so they're visible
    const [filtersOpen, setFiltersOpen] = useState<boolean>(() => Boolean(urlQuery.categoryNames || urlQuery.showcase));
    const [sortStrategy, setSortStrategy] = useState<ProjectSearchSortStrategy>(urlQuery.orderBy || "default")
    const anchorIndexRef = useRef<number>(0);
    // a page/limit pair that only exists for a render while a toggle's page change reaches the URL
    const skipQueryRef = useRef<{page: number, limit: number} | null>(null);

    const limit = pageLimit(filtersOpen);
    const pageNumber = urlQuery.page ?? 0;
    const searchQuery: ProjectSearchQuery = useMemo(() => ({...urlQuery, limit}), [urlQuery, limit]);

    function toggleFilters(): void {
        const nextFiltersOpen = !filtersOpen;
        const anchorIndex = anchorIndexFor(anchorIndexRef.current, pageNumber, limit);
        const nextPage = Math.floor(anchorIndex / pageLimit(nextFiltersOpen));
        anchorIndexRef.current = anchorIndex;
        setFiltersOpen(nextFiltersOpen);
        if (nextPage !== pageNumber) {
            // the panel state lands before the URL does, so don't fetch the old page at the new size in between
            skipQueryRef.current = {page: pageNumber, limit: pageLimit(nextFiltersOpen)};
            updateQuery({page: nextPage}, {replace: true});
        }
    }

    const _setSortStrategy = useCallback((strategy: ProjectSearchSortStrategy) => {
        updateQuery({
            orderBy: strategy
        })
        setSortStrategy(strategy);
    }, [updateQuery])

    useEffect(() => {
        const skip = skipQueryRef.current;
        skipQueryRef.current = null;
        if (skip && skip.page === searchQuery.page && skip.limit === searchQuery.limit) return;

        let ignore = false;
        (async () => {
                setLoading(true);
                let res: Response
                try {
                    res = await fetch(`${API_URL}/project/search?${toApiSearchParams(searchQuery)}`, {
                        credentials: "omit"
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
                    console.error(e)
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
                res = await fetch(`${API_URL}/category`, {
                    credentials: "omit"
                })
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
                res = await fetch(`${API_URL}/showcase/all`)
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
        const lowerBound = limit * pageNumber + 1
        const upperBound = Math.min((limit * pageNumber) + limit, searchResultInfo.totalResults)
        return [lowerBound, upperBound]
    }, [limit, pageNumber, searchResultInfo, projects])

    const pageCount: number = useMemo(() => {
        if (!projects) return 0
        if (!searchResultInfo?.totalResults) return 0
        return Math.ceil(searchResultInfo.totalResults / limit)
    }, [searchResultInfo, limit, projects])

    useEffect(() => {
        if (!document.scrollingElement) return
        document.scrollingElement.scrollTop = 0
    }, [searchQuery.page]);

    const selectedCategoryNames = splitList(searchQuery.categoryNames);
    const activeFilterName = selectedCategoryNames.length > 0
        ? (selectedCategoryNames.length === 1 ? selectedCategoryNames[0] : undefined)
        : searchQuery.showcase
            ? showcases.find((showcase) => showcase.id === searchQuery.showcase)
                ? getShowcaseName(showcases.find((showcase) => showcase.id === searchQuery.showcase)!)
                : undefined
            : undefined;
    const hasFilter = Boolean(searchQuery.categoryNames || searchQuery.showcase);
    const noResultsText = hasFilter
        ? `No ${activeFilterName ?? "selected"} applications match your filters`
        : "No applications match your results";

    return (
        <div className={`flex flex-col gap-6`}>
            <div className={`flex items-center gap-2`}>
                <h1 className={`font-headline font-bold text-3xl`}>Applications</h1>
                {loading && <Spinner />}
            </div>
            <div>
                {searchQuery.searchTerm ? (
                    <h2 className={`max-w-xl font-headline text-3xl font-bold leading-tight text-r-blue`}>
                        Search Results for:<br/>
                        {searchQuery.searchTerm}
                    </h2>
                ) : (
                    <h2 className={`sr-only`}>Search results</h2>
                )}
                <p className={`mt-3 text-sm text-body-text-gray`}>
                    {loading ? "Loading..." : `${searchResultInfo?.totalResults ?? 0} results found`}
                </p>
            </div>

            <SearchBar/>

            <div className={`flex items-center`}>
                <div className={`flex items-center justify-between`}>
                    <button
                        type="button"
                        aria-expanded={filtersOpen}
                        onClick={toggleFilters}
                        className={`flex items-center gap-2 text-sm font-bold text-black hover:text-r-red cursor-pointer`}
                    >
                        <img src="/icons/filter.svg" alt="" className={`h-4 w-4`}/>
                        Filter
                    </button>
                </div>

                <div className={`ml-auto`}>
                    <SearchOrderPicker
                        activeStrategy={sortStrategy}
                        strategies={[
                            "default", "popular",
                            "nameAsc", "nameDesc", "dateDesc", "dateAsc"
                        ]}
                        fn={(s) => {_setSortStrategy(s)}}
                    />
                </div>
            </div>

            <div className={`flex flex-col gap-6 md:flex-row`}>

                {filtersOpen &&
                    <FilterSection
                        filters={["showcase", "category"]}
                        categories={categories}
                        showcases={showcases}
                    />
                }
                <div className={`min-w-0 flex-1`}>
                    {initialLoading === false && projects.length > 0 ?
                        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${filtersOpen ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                            {projects.map((project) => (
                                <ProjectCard key={project.id} {...project} />
                            ))}
                        </div>
                        : !loading &&
                        <div className={`flex flex-col gap-8 items-center mt-12`}>
                            <FaSearch size={80} />
                            <span>{noResultsText}</span>
                        </div>
                    }
                </div>
            </div>
            <Paginator pageCount={pageCount} activePage={pageNumber} setPage={(page) => updateQuery({page})}/>
            <span className={`sr-only`}>{resultNumbers[0]}-{resultNumbers[1]}</span>
        </div>
    )
}