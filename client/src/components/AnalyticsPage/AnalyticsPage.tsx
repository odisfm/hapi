import {TopProjects} from "./TopProjects.tsx";

export function AnalyticsPage() {
    const dashboardUrl = import.meta.env.VITE_UMAMI_DASHBOARD_URL

    if (!dashboardUrl) {
        return <p>Analytics isn't configured for this environment.</p>
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <a
                    href={dashboardUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded bg-[#000054] px-4 py-2 font-bold text-white hover:opacity-80"
                >
                    Analytics Dashboard
                </a>
            </div>
            <TopProjects />
        </div>
    )
}