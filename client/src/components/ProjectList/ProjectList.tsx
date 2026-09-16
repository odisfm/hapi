import type {ProjectSearchQuery} from "@hapi/shared/types/apiRequests";
import {useEffect, useMemo, useRef, useState} from "react";
import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {API_URL} from "../../consts.ts";
import type {
    CategoryResponse,
    ProjectSearchResponse,
    SearchInfo,
    ShowcaseListResponse
} from "@hapi/shared/types/apiResponses";
import {ProjectListItem} from "./ProjectListItem.tsx";
import {Paginator} from "../ProjectEditor/Paginator.tsx";
import {FaPlus, FaSearch, FaSpinner} from "react-icons/fa";
import {MdCancel} from "react-icons/md";
import type {Category, Showcase} from "@hapi/shared/prisma/client.ts";
import {FilterSection} from "./FilterSection.tsx";
import {Link} from "react-router";

export function ProjectList() {
    const [searchQuery, setSearchQuery] = useState<ProjectSearchQuery>({
        limit: 10,
        page: 0
    });
    const [projects, setProjects] = useState<ProjectPreviewType[]>([])
    const [searchResultInfo, setSearchResultInfo] = useState<SearchInfo | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const searchBarRef = useRef<HTMLInputElement | null>(null);
    const [searchBarText, setSearchBarText] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [showcases, setShowcases] = useState<Showcase[]>([]);

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
                        credentials: "include",
                    })
                    if (!res.ok) {
                        console.error(res)
                        throw new Error("Failed to get projects")
                    }
                    const json: ProjectSearchResponse = await res.json()
                    setProjects(json.projects)
                    setSearchResultInfo(json.info)
                    console.log(json.info)
                } catch (e) {
                    console.error(e) // todo
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
        return Math.ceil(searchResultInfo.totalResults! / searchQuery.limit!)
    }, [searchResultInfo, searchQuery.limit, projects])
    
    function _setPageNumber(pageNumber: number): void {
        setPageNumber(pageNumber)
        setSearchQuery({
            ...searchQuery,
            page: pageNumber
        })
    }

    function setSearchTerm(value: string): void {
        if (value !== searchQuery.searchTerm) {
            mutateSearchQuery({
                ...searchQuery,
                searchTerm: value
            })
        }
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
        setPageNumber(newQuery.page || 0)
        setSearchQuery(query)
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
            if (searchResultInfo.totalResults <= (searchQuery.limit || 1)) {
                resultsText = `${searchResultInfo.totalResults} projects found.`
            } else {
                resultsText = `${searchResultInfo.totalResults} projects found, showing ${resultNumbers[0]}-${resultNumbers[1]}.`
            }
        }
    }

    return (
        <div className={`flex flex-col gap-4 w-full md:w-2/3`}>

            <div className={`flex items-center`}>
                <div className={`flex gap-2 items-center`}>
                    <h2 className={`font-headline font-bold text-3xl`}>Projects</h2>
                    {loading && <FaSpinner className={`animate-spin`}/>}
                </div>

                <Link to={`project/new`} className={`
                ml-auto rounded-lg bg-r-red hover:bg-r-yellow-500 text-white hover:text-black transition-colors px-4 py-2 cursor-pointer
                font-bold flex items-center gap-2
                `}>
                    <FaPlus /> <span>New project</span>
                </Link>
            </div>
            <span>{loading ? "Loading..." : resultsText}</span>

            <form className={`flex items-center gap-2`} onSubmit={((e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                setSearchTerm(String(formData.get('searchBar')))
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
                        setSearchTerm("")
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
            <Paginator pageCount={pageCount} activePage={pageNumber} setPage={_setPageNumber}/>
            <div className={`flex flex-col md:flex-row gap-2`}>
                <FilterSection
                    searchQuery={searchQuery}
                    setSearchQuery={mutateSearchQuery}
                    categories={categories}
                    showcases={showcases}
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
            <Paginator pageCount={pageCount} activePage={pageNumber} setPage={_setPageNumber}/>

        </div>
    )
}