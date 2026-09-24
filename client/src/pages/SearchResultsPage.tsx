import type {ProjectSearchQuery} from "@hapi/shared/types/apiRequests";
import {useEffect, useMemo, useRef, useState} from "react";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {API_URL} from "../consts.ts";
import type {
    CategoryResponse,
    ProjectSearchResponse,
    SearchInfo,
    ShowcaseListResponse
} from "@hapi/shared/types/apiResponses";
import type {Category, Showcase} from "@hapi/shared/prisma/client";
import {useLocation} from "react-router";
import ProjectCard from "../components/ProjectCard.tsx";
import {Paginator} from "../components/ProjectEditor/Paginator.tsx";
import {PublicFilterSection} from "../components/ProjectList/PublicFilterSection.tsx";
import {getShowcaseName} from "../utils/getShowcaseName.ts";
import {FaSearch} from "react-icons/fa";
import {MdCancel} from "react-icons/md";

export default function SearchResultsPage() {
    const location = useLocation();
    const initialSearchTerm = new URLSearchParams(location.search).get("q") ?? "";
    const [searchQuery, setSearchQuery] = useState<ProjectSearchQuery>({
        limit: 15,
        page: 0,
        searchTerm: initialSearchTerm
    });
    const [projects, setProjects] = useState<ProjectPreviewType[]>([])
    const [searchResultInfo, setSearchResultInfo] = useState<SearchInfo | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showcases, setShowcases] = useState<Showcase[]>([]);
    const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
    const anchorIndexRef = useRef<number>(0);
    const searchBarRef = useRef<HTMLInputElement | null>(null);
    const [searchBarText, setSearchBarText] = useState<string>("");

    function toggleFilters(): void {
        const nextFiltersOpen = !filtersOpen;
        const newLimit = nextFiltersOpen ? 14 : 15;
        const newPage = Math.floor(anchorIndexRef.current / newLimit);
        setFiltersOpen(nextFiltersOpen);
        mutateSearchQuery({
            ...searchQuery,
            limit: newLimit,
            page: newPage
        });
    }

    useEffect(() => {
        (async () => {
                setLoading(true);
                let res: Response
                try {
                    const params = new URLSearchParams(
                        Object.fromEntries(
                            Object.entries(searchQuery).map(([k, v]) => [k, String(v)])
                        )
                    );
                    res = await fetch(`${API_URL}/project/search?${params}`, {
                    })
                    if (!res.ok) {
                        console.error(res)
                        throw new Error("Failed to get projects")
                    }
                    const json: ProjectSearchResponse = await res.json()
                    setProjects(json.projects)
                    setSearchResultInfo(json.info)
                } catch (e) {
                    console.error(e)
                }
                setLoading(false)
                setInitialLoading(false)
            }
        )()

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
        const limit = searchQuery.limit!
        const lowerBound = limit * pageNumber + 1
        const upperBound = Math.min((limit * pageNumber) + limit, searchResultInfo!.totalResults)
        return [lowerBound, upperBound]
    }, [searchQuery.limit, pageNumber, searchResultInfo, projects])

    const pageCount: number = useMemo(() => {
        if (!projects) return 0
        if (!searchResultInfo?.totalResults) return 0
        const count = Math.ceil(searchResultInfo.totalResults! / (searchQuery?.limit || 0))
        return count === Infinity ? 1 : count
    }, [searchResultInfo, searchQuery.limit, projects])

    function _setPageNumber(pageNumber: number): void {
        anchorIndexRef.current = pageNumber * searchQuery.limit!;
        setPageNumber(pageNumber)
        setSearchQuery({
            ...searchQuery,
            page: pageNumber
        })
    }

    function mutateSearchQuery(newQuery: ProjectSearchQuery) {
        let needsPageReset = false
        if (newQuery.category !== searchQuery.category) needsPageReset = true
        if (newQuery.showcase !== searchQuery.showcase) needsPageReset = true
        if (newQuery.searchTerm !== searchQuery.searchTerm) needsPageReset = true

        const query = {
            ...newQuery,
            page: needsPageReset ? 0 : newQuery.page,
        }
        if (needsPageReset) {
            anchorIndexRef.current = 0;
        }
        setPageNumber(newQuery.page || 0)
        setSearchQuery(query)
    }

    const activeFilterName = searchQuery.category
        ? categories.find((category) => category.id === searchQuery.category)?.name
        : searchQuery.showcase
            ? showcases.find((showcase) => showcase.id === searchQuery.showcase)
                ? getShowcaseName(showcases.find((showcase) => showcase.id === searchQuery.showcase)!)
                : undefined
            : undefined;
    const hasFilter = Boolean(searchQuery.category || searchQuery.showcase);
    const noResultsText = hasFilter
        ? `No ${activeFilterName ?? "selected"} applications match your filters`
        : "No applications match your results";

    return (
        <div className={`flex w-full max-w-5xl flex-col gap-6`}>
            <div>
                <h1 className={`max-w-xl font-headline text-3xl font-bold leading-tight text-r-blue`}>
                    Search Results for:<br />
                    {searchQuery.searchTerm}
                </h1>
                <p className={`mt-3 text-sm text-body-text-gray`}>
                    {loading ? "Loading..." : `${searchResultInfo?.totalResults ?? 0} results found`}
                </p>
            </div>

            <form className={`flex items-center gap-2`} onSubmit={((e) => {
                e.preventDefault();
                mutateSearchQuery({
                    ...searchQuery, searchTerm: searchBarText
                })
            })}>
                <input
                    name={"searchBar"}
                    className={`bg-neutral-200 rounded-lg p-2 flex-1`}
                    placeholder={"search by project name, description, developers"}
                    ref={searchBarRef}
                    onChange={(e) => {setSearchBarText(e.target.value)}}
                />
                {searchBarText.length > 0 &&
                    <button
                        type={"button"}
                        className={`p-3 rounded-md bg-r-yellow-500 hover:bg-r-yellow-400 cursor-pointer text-black`}
                        onClick={() => {
                            setSearchBarText("")
                            searchBarRef.current!.value = ""
                        }}
                    >
                        <MdCancel/>
                    </button>
                }
                <button
                    type={"submit"}
                    className={`
                    bg-r-red hover:bg-r-yellow-500 text-white hover:text-black px-4 py-2 rounded-xl flex items-center gap-2
                    cursor-pointer transition-colors
                    `}>
                    <FaSearch />
                    <span>Search</span>
                </button>
            </form>

            <div className={`flex items-center justify-between`}>
                <button
                    type="button"
                    aria-expanded={filtersOpen}
                    onClick={toggleFilters}
                    className={`flex items-center gap-2 text-sm font-bold text-black hover:text-r-red cursor-pointer`}
                >
                    <img src="/icons/filter.svg" alt="" className={`h-4 w-4`} />
                    Filter
                </button>
            </div>

            <div className={`flex flex-col gap-6 md:flex-row`}>
                {filtersOpen &&
                    <PublicFilterSection
                        searchQuery={searchQuery}
                        setSearchQuery={mutateSearchQuery}
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

            <Paginator pageCount={pageCount} activePage={pageNumber} setPage={_setPageNumber}/>
            <span className={`sr-only`}>{resultNumbers[0]}-{resultNumbers[1]}</span>
        </div>
    )
}