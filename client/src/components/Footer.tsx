import {useEffect, useState} from "react";
import {Link} from "react-router";
import {API_URL} from "../consts.ts";
import type {ShowcaseListResponse, ShowcaseListResponseItem} from "@hapi/shared/types/apiResponses";
import {getShowcaseName} from "@hapi/shared/utils/getShowcaseName";

export function Footer() {
    const [showcases, setShowcases] = useState<ShowcaseListResponseItem[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        const getShowcases = async () => {
            try {
                const res = await fetch(`${API_URL}/showcase/all`, {
                    method: "GET",
                    credentials: "omit",
                    signal: controller.signal,
                });
                if (!res.ok) return;

                const json: ShowcaseListResponse = await res.json();
                if (controller.signal.aborted) return;

                setShowcases(
                    json.showcases
                        .filter((showcase) => showcase._count.projects)
                        .sort((a, b) => {
                            const yearComparison = (b.year ?? 0) - (a.year ?? 0);
                            if (yearComparison !== 0) return yearComparison;
                            return (b.semester ?? 0) - (a.semester ?? 0);
                        })
                        .slice(0, 4),
                );
            } catch {
                // Ignore navigation error
            }
        };

        void getShowcases();
        return () => controller.abort();
    }, []);

    return (
        <footer className="w-full bg-r-blue text-xs text-white">
            <div className="mx-auto grid max-w-[1416px] grid-cols-1 gap-8 px-10 py-12 sm:py-16 md:grid-cols-3 md:items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <img
                            src="/rmit-logo-red.png"
                            alt="RMIT"
                            className="h-6 w-6 flex-shrink-0 object-contain"
                        />
                        <span className="text-base font-bold">
                                    RMIT HAPI -
                                </span>
                    </div>
                    <h2 className="text-base font-bold leading-tight">
                        Hub for Apple Innovation.
                    </h2>
                    <p className="mt-2 max-w-[290px] leading-5">
                        HAPI enriches student experiences and empowers them to make
                        impactful contributions to the tech industry.
                    </p>
                </div>
                {showcases.length > 0 && (
                    <div className="md:justify-self-center">
                        <h2 className="text-base font-bold leading-tight">
                            <Link
                                to="/showcase"
                                className="text-white hover:text-r-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Showcases
                            </Link>
                        </h2>
                        <ul className="mt-2 flex max-w-[220px] flex-col leading-5">
                            {showcases.map((showcase) => (
                                <li key={showcase.id}>
                                    <Link
                                        to={`/showcase/${showcase.slugs.at(0)?.slug || showcase.id}`}
                                        className="inline-block py-1.5 text-xs text-white hover:text-r-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        {getShowcaseName(showcase)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <Link
                    to="/admin-login"
                    className="text-base font-bold leading-5 text-white hover:text-r-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:col-start-3 md:justify-self-end"
                >
                    Admin Login
                </Link>
            </div>
        </footer>
    )
}