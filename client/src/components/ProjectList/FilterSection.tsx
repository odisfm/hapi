import type {Category, Showcase} from "@hapi/shared/prisma/client";
import {getShowcaseName} from "@hapi/shared/utils/getShowcaseName";
import {Button} from "../generic/Button.tsx";
import {splitList, type UrlSearchQuery, useProjectSearchParams} from "./useProjectSearchParams.ts";

export type FilterType = "showcase" | "category" | "published";

/** Which search field each filter controls. */
const QUERY_KEY = {
    showcase: "showcase",
    category: "categoryNames",
    published: "published",
} as const satisfies Record<FilterType, keyof UrlSearchQuery>;

const PUBLISHED_OPTIONS = [undefined, "published", "unpublished"] as const;

type Props = {
    /** filters to show, in display order */
    filters: FilterType[];
    categories: Category[];
    showcases: Showcase[];
    /** show a "Filter" heading, with "clear all" beside it */
    showTitle?: boolean;
}

export function FilterSection({
                                  filters,
                                  categories,
                                  showcases,
                                  showTitle = false
                              }: Props) {
    const [searchQuery, updateQuery] = useProjectSearchParams();
    const selectedCategories = splitList(searchQuery.categoryNames);
    const hasFilter = filters.some((filter) => searchQuery[QUERY_KEY[filter]] !== undefined);

    function toggleCategory(categoryName: string) {
        const next = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((name) => name !== categoryName)
            : [...selectedCategories, categoryName];
        updateQuery({categoryNames: next.join(",") || undefined});
    }

    function clearAll() {
        const cleared: Partial<UrlSearchQuery> = {};
        filters.forEach((filter) => {
            cleared[QUERY_KEY[filter]] = undefined;
        });
        updateQuery(cleared);
    }

    const clearButton = hasFilter &&
        <Button
            color={"yellow"}
            variant={"compact"}
            styles={showTitle ? "ml-auto" : "self-start"}
            onClick={clearAll}
        >
            clear all
        </Button>;

    function renderFilter(filter: FilterType) {
        switch (filter) {
            case "showcase":
                return (
                    <div key={filter} className={`flex flex-col gap-1`}>
                        <span>Showcase</span>
                        <ul>
                            {showcases.map((s) => {
                                const active = searchQuery.showcase === s.id
                                return (
                                    <li key={s.id} className={`mb-1`}>
                                        <Button
                                            variant={"compact"}
                                            color={active ? "light-blue" : "grey"}
                                            active={active}
                                            styles={`text-xs text-left !p-1`}
                                            onClick={() => updateQuery({showcase: s.id})}
                                        >
                                            {getShowcaseName(s)}
                                        </Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                );
            case "category":
                return (
                    <div key={filter} className={`flex flex-col gap-1`}>
                        <span>Category</span>
                        <ul className={`flex flex-wrap gap-1`}>
                            {categories.map((c) => {
                                const active = selectedCategories.includes(c.name)
                                return (
                                    <li key={c.id} className={`mb-1`}>
                                        <Button
                                            variant={"compact"}
                                            color={active ? "light-blue" : "grey"}
                                            styles={`text-xs`}
                                            active={active}
                                            onClick={() => toggleCategory(c.name)}
                                        >
                                            {c.name}
                                        </Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                );
            case "published":
                return (
                    <div key={filter} className={`flex flex-col gap-1`}>
                        <span>Published</span>
                        <ul className={`flex flex-wrap gap-1`}>
                            {PUBLISHED_OPTIONS.map((p) => {
                                const active = p === searchQuery.published;
                                return (
                                    <li key={p ?? "all"} className={`mb-1`}>
                                        <Button
                                            variant={"compact"}
                                            color={active ? "light-blue" : "grey"}
                                            active={active}
                                            styles={`text-xs`}
                                            onClick={() => updateQuery({published: p})}
                                        >
                                            {p ? p.slice(0, 1).toUpperCase() + p.slice(1) : "All"}
                                        </Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                );
        }
    }

    return (
        <nav className={`bg-neutral-200 w-full md:w-60 rounded-md self-start p-2 flex flex-col gap-2`}>
            {showTitle
                ? <div className={`flex items-center`}>
                    <span className={`font-bold text-black/70`}>Filter</span>
                    {clearButton}
                </div>
                : clearButton
            }
            {filters.map(renderFilter)}
        </nav>
    )
}