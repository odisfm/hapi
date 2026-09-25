import type {ProjectSearchQuery} from "@hapi/shared/types/apiRequests";
import type {Category, Showcase} from "@hapi/shared/prisma/client";
import {getShowcaseName} from "../../utils/getShowcaseName.ts";
import {Button} from "../generic/Button.tsx";

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
                <Button
                    color={"yellow"}
                    variant={"compact"}
                    styles={"self-start"}
                    onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const {showcase, category, ...rest} = searchQuery;
                        setSearchQuery(rest);
                    }}
                >
                clear all
            </Button>
            }
            <div className={`flex flex-col gap-1`}>
                <span>Showcase</span>
                <ul>
                    {showcases.map((s, i) => {
                        const active = searchQuery.showcase === s.id
                        return (
                            <li key={i} className={`mb-1`}>
                                <Button
                                    variant={"compact"}
                                    color={active ? "light-blue" : "grey"}
                                    active={active}
                                    styles={`text-xs text-left !p-1`}
                                    onClick={() => {
                                        setSearchQuery({...searchQuery, page: 0, showcase: s.id});
                                    }}
                                >
                                    {getShowcaseName(s)}
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className={`flex flex-col gap-1`}>
                <span>Category</span>
                <ul className={`flex flex-wrap gap-1`}>
                    {categories.map((c, i) => {
                        const active = searchQuery.category === c.id;
                        return (
                            <li key={i} className={`mb-1`}>
                                <Button
                                    variant={"compact"}
                                    color={active ? "light-blue" : "grey"}
                                    styles={`text-xs`}
                                    active={active}
                                    onClick={() => {
                                        setSearchQuery({...searchQuery, page: 0, category: c.id});
                                    }}
                                >
                                    {c.name}
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </nav>
    )
}