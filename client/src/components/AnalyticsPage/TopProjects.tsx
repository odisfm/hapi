import type {AnalyticsProjectResponse} from "@hapi/shared/types/apiResponses";
import {useCallback, useEffect, useState} from "react";
import {useModal} from "../../contexts/modal/useModal.ts";
import {API_URL} from "../../consts.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = {
    day: {label: "Last 24 hours", ms: DAY_MS},
    week: {label: "Last 7 days", ms: 7 * DAY_MS},
    month: {label: "Last 30 days", ms: 30 * DAY_MS},
};

type PresetKey = keyof typeof PRESETS;
type RangeKey = PresetKey | "custom";

const TOP_COUNT = 10;

export function TopProjects() {
    const [analytics, setAnalytics] = useState<AnalyticsProjectResponse["analytics"]>([]);
    const [range, setRange] = useState<RangeKey>("week");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const modalContext = useModal();

    const getAnalytics = useCallback(async () => {
        let startDate: Date
        let endDate: Date

        if (range === "custom") {
            if (!customStart || !customEnd) {
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
                throw new Error(res.statusText);
            }
            const json: AnalyticsProjectResponse = await res.json();
            setAnalytics(json.analytics.filter((project) => project.views > 0).slice(0, TOP_COUNT));
        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [range, customStart, customEnd, modalContext])

    useEffect(() => {
        void getAnalytics()
    }, [getAnalytics]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
                <h2 className="font-bold text-xl">Most viewed projects</h2>
                <select
                    value={range}
                    onChange={(event) => setRange(event.target.value as RangeKey)}
                >
                    {Object.entries(PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.label}</option>
                    ))}
                    <option value="custom">Custom range</option>
                </select>
                {range === "custom" && (
                    <>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(event) => setCustomStart(event.target.value)}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(event) => setCustomEnd(event.target.value)}
                        />
                    </>
                )}
            </div>
            {analytics.length === 0 ? (
                <p>No projects were viewed during this period.</p>
            ) : (
                <ol className="list-decimal pl-6">
                    {analytics.map((project) => (
                        <li key={project.project.id}>
                            {project.project.name} ({project.views} views)
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}