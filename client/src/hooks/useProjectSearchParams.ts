import {useCallback, useMemo} from "react";
import {useNavigate, useSearchParams} from "react-router";
import type {ProjectSearchQuery} from "@hapi/shared/types/apiRequests";

/**
 * The parts of a project search that live in the URL.
 * Page size is a layout concern, so each page adds its own `limit` before fetching.
 */
export type UrlSearchQuery = Pick<ProjectSearchQuery, "searchTerm" | "page" | "categoryNames" | "showcase" | "published" | "orderBy">;

/** URL param name for each field. Category names share one param, joined on "," like the API. */
const PARAM = {
    searchTerm: "q",
    page: "page",
    categoryNames: "categoryNames",
    showcase: "showcase",
    published: "published",
    orderBy: "orderBy"
} as const;

/** Changing any of these sends the user back to the first page. */
const PAGE_RESET_KEYS = ["searchTerm", "categoryNames", "showcase", "published", "orderBy"] as const;

/** Splits a ","-joined list, dropping blanks. */
export function splitList(value: string | undefined): string[] {
    return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

/** Reads a search from URL params. Pages are 1-based in the URL and 0-based in the query. */
export function parseSearchParams(params: URLSearchParams): UrlSearchQuery {
    const query: UrlSearchQuery = {page: 0};

    const searchTerm = params.get(PARAM.searchTerm);
    if (searchTerm) query.searchTerm = searchTerm;

    const page = Number(params.get(PARAM.page));
    if (Number.isInteger(page) && page > 1) query.page = page - 1;

    const categoryNames = splitList(params.get(PARAM.categoryNames) ?? undefined);
    if (categoryNames.length > 0) query.categoryNames = categoryNames.join(",");

    const showcase = params.get(PARAM.showcase);
    if (showcase) query.showcase = showcase;

    const published = params.get(PARAM.published);
    if (published === "published" || published === "unpublished") query.published = published;

    const orderBy = params.get(PARAM.orderBy);
    if (orderBy) query.orderBy = orderBy as UrlSearchQuery["orderBy"];

    return query;
}

/** Writes a search into a copy of `base`, leaving any params this hook doesn't own untouched. */
export function writeSearchParams(base: URLSearchParams, query: UrlSearchQuery): URLSearchParams {
    const params = new URLSearchParams(base);
    Object.values(PARAM).forEach((key) => params.delete(key));

    if (query.searchTerm) params.set(PARAM.searchTerm, query.searchTerm);
    const categoryNames = splitList(query.categoryNames);
    if (categoryNames.length > 0) params.set(PARAM.categoryNames, categoryNames.join(","));
    if (query.showcase) params.set(PARAM.showcase, query.showcase);
    if (query.published) params.set(PARAM.published, query.published);
    if (query.page) params.set(PARAM.page, String(query.page + 1));
    if (query.orderBy) params.set(PARAM.orderBy, query.orderBy);

    return params;
}

/** Applies an update, resetting to the first page if the search term or any filter changed. */
export function applySearchUpdate(current: UrlSearchQuery, update: Partial<UrlSearchQuery>): UrlSearchQuery {
    const next = {...current, ...update};
    const searchChanged = PAGE_RESET_KEYS.some((key) => (next[key] || undefined) !== (current[key] || undefined));
    if (searchChanged) next.page = 0;
    return next;
}

/** Turns a query into params for `/project/search`, dropping unset fields. */
export function toApiSearchParams(query: ProjectSearchQuery): URLSearchParams {
    return new URLSearchParams(
        Object.entries(query)
            .filter(([, value]) => value !== undefined && value !== "")
            .map(([key, value]) => [key, String(value)])
    );
}

/**
 * The current project search, read from and written to the URL's query params.
 * Every component using this hook sees the same search, and back/forward navigation re-runs it.
 */
export function useProjectSearchParams() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const paramString = searchParams.toString();
    const query = useMemo(() => parseSearchParams(new URLSearchParams(paramString)), [paramString]);

    const updateQuery = useCallback((update: Partial<UrlSearchQuery>, options?: {replace?: boolean}) => {
        const next = writeSearchParams(searchParams, applySearchUpdate(query, update));
        if (next.toString() === searchParams.toString()) return;
        // URLSearchParams escapes "," as %2C; commas are valid in a query string, so keep them readable
        const search = next.toString().replaceAll("%2C", ",");
        navigate({search: search ? `?${search}` : ""}, {replace: options?.replace, preventScrollReset: true});
    }, [searchParams, navigate, query]);

    return [query, updateQuery] as const;
}