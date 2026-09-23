import type {ProjectSearchQuery} from "@hapi/shared/types/apiRequests";
import type {Category, Showcase} from "@hapi/shared/prisma/client";
import {getShowcaseName} from "../../utils/getShowcaseName.ts";

type Props = {
    searchQuery: ProjectSearchQuery;
    setSearchQuery: (query: ProjectSearchQuery) => void;
    categories: Category[],
    showcases: Showcase[],
}

export function PublicFilterSection({
    searchQuery,
    setSearchQuery,
    categories,
    showcases
}: Props) {

    const hasFilter = searchQuery.showcase || searchQuery.category
    return (
        <nav className={`bg-neutral-200 w-full md:w-60 rounded-md self-start p-2 flex flex-col gap-2`}>
            {hasFilter &&
                <button
                className={`
                ml-auto p-1 rounded-md bg-r-yellow-500 hover:bg-r-yellow-400 text-xs cursor-pointer
                `}
                onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const {showcase, category, ...rest} = searchQuery;
                    setSearchQuery(rest);
                }}>

                clear all
            </button>
            }
            <div className={`flex flex-col gap-1`}>
                <span>Showcase</span>
                <ul>
                    {showcases.map((s, i) => {
                        return (
                            <li key={i} className={`mb-1`}>
                                <button className={`
                                text-left text-xs p-1 rounded-md bg-neutral-300 cursor-pointer
                                ${s.id === searchQuery.showcase ? `bg-r-blue-500 text-white` : ``}
                                `}
                                onClick={() => {
                                    setSearchQuery({...searchQuery, page: 0, showcase: s.id});
                                }}
                                >
                                    {getShowcaseName(s)}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className={`flex flex-col gap-1`}>
                <span>Category</span>
                <ul className={`flex flex-wrap gap-1`}>
                    {categories.map((c, i) => {
                        return (
                            <li key={i} className={`mb-1`}>
                                <button className={`
                                text-left text-xs p-1 rounded-md bg-neutral-300 cursor-pointer
                                ${c.id === searchQuery.category ? `bg-r-blue-500 text-white` : ``}
                                `}
                                        onClick={() => {
                                            setSearchQuery({...searchQuery, page: 0, category: c.id});
                                        }}
                                >
                                    {c.name}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </nav>
    )
}