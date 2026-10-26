import type {Category} from "@hapi/shared/prisma/client";
import type {ShowcaseListResponseItem} from "@hapi/shared/types/apiResponses";
import {Button} from "../../../components/generic/Button.tsx";
import {splitList, type UrlSearchQuery, useProjectSearchParams} from "../../../hooks/useProjectSearchParams.ts";
import {buildConsolidatedShowcases, type ConsolidatedShowcaseType} from "../../public/ShowcaseIndexPage/types.ts";

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
    showcases: ShowcaseListResponseItem[];
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
    const selectedShowcaseIds = splitList(searchQuery.showcase);
    const consolidatedShowcases = buildConsolidatedShowcases(showcases);
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

    function getShowcases(program: ConsolidatedShowcaseType): ShowcaseListResponseItem[] {
        const yearShowcases = program.yearShowcases?.flatMap((year) => [
            ...(year.showcase ? [year.showcase] : []),
            ...(year.semesters?.map((semester) => semester.showcase) ?? []),
        ]) ?? [];
        return [
            ...(program.standaloneShowcase ? [program.standaloneShowcase] : []),
            ...yearShowcases,
        ];
    }

    function toggleShowcase(program: ConsolidatedShowcaseType, showcase?: ShowcaseListResponseItem) {
        const programShowcases = getShowcases(program);
        const next = showcase
            ? [showcase.id]
            : programShowcases.some((item) => selectedShowcaseIds.includes(item.id))
                ? []
                : programShowcases.map((item) => item.id);
        updateQuery({showcase: next.join(",") || undefined});
    }

    const clearButton = hasFilter &&
        <Button
            color={"red"}
            variant={"compact"}
            styles={"shrink-0 whitespace-nowrap hover:!bg-r-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-r-red ml-auto"}
            onClick={clearAll}
        >
            clear all
        </Button>;

    function renderFilter(filter: FilterType) {
        switch (filter) {
            case "showcase":
                return (
                    <div key={filter} className={`flex flex-col gap-1`}>
                        <div className={`flex justify-between items-center`}>
                            <span>Showcase</span>
                            {!showTitle && clearButton}
                        </div>
                        <ul>
                            {consolidatedShowcases.map((program) => {
                                const programShowcases = getShowcases(program);
                                const programSelected = programShowcases.some((item) => selectedShowcaseIds.includes(item.id));
                                const showSubOptions = programShowcases.length > 1 && programSelected;
                                return (
                                    <li key={program.name} className={`mb-1`}>
                                        <Button
                                            variant={"compact"}
                                            color={programSelected ? "light-blue" : "grey"}
                                            active={programSelected}
                                            styles={`text-xs text-left !p-1`}
                                            onClick={() => toggleShowcase(program)}
                                        >
                                            {program.name}
                                        </Button>
                                        {showSubOptions &&
                                            <ul className="ml-3 mt-1">
                                                {programShowcases.map((showcase) => (
                                                    <li key={showcase.id} className="mb-1">
                                                        <Button
                                                            variant={"compact"}
                                                            color={selectedShowcaseIds.includes(showcase.id) ? "light-blue" : "grey"}
                                                            active={selectedShowcaseIds.includes(showcase.id)}
                                                            styles="text-xs text-left !p-1"
                                                            onClick={() => toggleShowcase(program, showcase)}
                                                        >
                                                            {showcase.year}{showcase.semester ? ` sem${showcase.semester}` : ""}
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        }
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
                : !filters.includes("showcase") && clearButton
            }
            {filters.map(renderFilter)}
        </nav>
    )
}