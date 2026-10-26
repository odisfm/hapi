import type {AnalyticsProjectResponse} from "@hapi/shared/types/apiResponses";
import {useCallback, useEffect, useState} from "react";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import {AppIcon} from "../../../components/AppIcon.tsx";
import {Paginator} from "../ProjectEditor/Paginator.tsx";
import {throwErrorFromResponse} from "../../../utils/misc.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = {
    day: {label: "Last 24 hours", ms: DAY_MS},
    week: {label: "Last 7 days", ms: 7 * DAY_MS},
    month: {label: "Last 30 days", ms: 30 * DAY_MS},
};

type PresetKey = keyof typeof PRESETS;
type RangeKey = PresetKey | "custom";

const PAGE_SIZE = 10;

export function TopProjects() {
    const [analytics, setAnalytics] = useState<AnalyticsProjectResponse["analytics"]>([]);
    const [page, setPage] = useState(0);
    const [range, setRange] = useState<RangeKey>("week");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const modalContext = useModal();

    const getAnalytics = useCallback(async () => {
        let startDate: Date
        let endDate: Date

        if (range === "custom") {
            if (!customStart || !customEnd || customStart > customEnd) {
                setAnalytics([]);
                return
            }
            startDate = new Date(`${customStart}T00:00:00`)
            endDate = new Date(`${customEnd}T23:59:59.999`)
        } else {
            endDate = new Date()
            startDate = new Date(endDate.getTime() - PRESETS[range].ms)
        }

        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        })

        try {
            const res = await fetch(`${API_URL}/analytics/project?${params}`, {
                credentials: "include"
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            const json: AnalyticsProjectResponse = await res.json();
            setAnalytics(json.analytics.filter((project) => project.views > 0));
        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [range, customStart, customEnd, modalContext])

    useEffect(() => {
        (async () => {
           getAnalytics();
        })()
    }, [getAnalytics]);

    const invalidRange = range === "custom" && !!customStart && !!customEnd && customStart > customEnd;
    const dateInputClass = `rounded-md border bg-white px-2 py-1.5 ${invalidRange ? "border-red-500" : "border-neutral-300"}`;

    const pageCount = Math.ceil(analytics.length / PAGE_SIZE);
    const pageProjects = analytics.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="overflow-hidden rounded-2xl bg-section-grey">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <h2 className="font-bold text-xl">Most Viewed Projects</h2>
                <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
                    <select
                        className="rounded-md border border-neutral-300 bg-white px-2 py-1.5"
                        value={range}
                        onChange={(event) => {
                            setRange(event.target.value as RangeKey);
                            setPage(0);
                        }}
                    >
                        {Object.entries(PRESETS).map(([key, preset]) => (
                            <option key={key} value={key}>{preset.label}</option>
                        ))}
                        <option value="custom">Custom range</option>
                    </select>
                    {range === "custom" && (
                        <>
                            <input
                                className={dateInputClass}
                                type="date"
                                aria-invalid={invalidRange}
                                max={customEnd || undefined}
                                value={customStart}
                                onChange={(event) => {
                                    setCustomStart(event.target.value);
                                    setPage(0);
                                }}
                                aria-label={"Start date"}
                            />
                            <span>to</span>
                            <input
                                className={dateInputClass}
                                type="date"
                                aria-invalid={invalidRange}
                                min={customStart || undefined}
                                value={customEnd}
                                onChange={(event) => {
                                    setCustomEnd(event.target.value);
                                    setPage(0);
                                }}
                                aria-label={"End date"}
                            />
                        </>
                    )}
                </div>
            </div>
            {invalidRange ? (
                <p role="alert" className="border-t border-neutral-200 px-4 py-4 text-sm text-red-600">
                    Start date must be on or before the end date.
                </p>
            ) : analytics.length === 0 ? (
                <p className="border-t border-neutral-200 px-4 py-4 text-sm text-neutral-600">
                    No projects were viewed during this period.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[28rem] border-collapse text-sm">
                        <thead className="border-t border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                            <tr>
                                <th className="w-16 px-4 py-2 font-medium">Rank</th>
                                <th className="px-4 py-2 font-medium">Project</th>
                                <th className="w-24 px-4 py-2 text-right font-medium">Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageProjects.map((project, index) => (
                                <tr
                                    className="border-t border-neutral-200 bg-white/60"
                                    key={project.project.id}
                                >
                                    <td className="px-4 py-2 font-semibold text-neutral-500">
                                        {page * PAGE_SIZE + index + 1}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <AppIcon uri={project.project.iconUrl} width={32} />
                                            <span className="truncate font-medium">{project.project.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-right font-semibold tabular-nums">
                                        {project.views}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pageCount > 1 && (
                        <div className="flex min-h-14 items-center justify-center py-2 [&>nav]:items-center">
                            <Paginator pageCount={pageCount} activePage={page} setPage={setPage} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}