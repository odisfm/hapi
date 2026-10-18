import {TopProjects} from "./TopProjects.tsx";

export function AnalyticsPage() {
    const dashboardUrl = import.meta.env.VITE_UMAMI_DASHBOARD_URL

    return (
        <div className="flex flex-col gap-6">
            <div className={`flex items-center gap-2`}>
                <h3 className={`font-bold text-3xl uppercase`}>Analytics</h3>
            </div>
            <div>
                {
                    dashboardUrl ?
                        <a
                            href={dashboardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded bg-[#000054] px-4 py-2 font-bold text-white hover:opacity-80"
                        >
                            Analytics Dashboard
                        </a>
                        :
                        <p className={`bg-red-800/30 p-4 rounded-md self-start`}>Umami analytics isn't configured for this environment.</p>
                }
            </div>
            <TopProjects/>
        </div>
    )
}