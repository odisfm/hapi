import type {ConsolidatedShowcaseType} from "./types.ts";
import {Link} from "react-router";

export function ShowcaseItem({data}: {data: ConsolidatedShowcaseType}) {
    return (
        <div className={`flex flex-col gap-2 w-full pl-6 border-l-1 border-l-r-blue-300`}>
            <span className={`text-2xl font-bold min-h-15`}>{data.name}</span>
            {data.standaloneShowcase &&
            <Link
                to={`/showcase/${data.standaloneShowcase.slugs.at(0)?.slug || data.standaloneShowcase.id}`}
                className={`hover:underline`}
            >
                View
            </Link>
            }
            {data.yearShowcases && data.yearShowcases.map((ys) => {
                return (
                    <>
                        {
                            ys.showcase ?
                                <Link
                                    to={`/showcase/${ys.showcase.slugs.at(0)?.slug || ys.showcase.id}`}
                                    className={`text-lg font-bold hover:underline`}
                                >
                                    {ys.year}
                                </Link>
                                :
                                <>
                                <span className={`font-bold text-lg`}>{ys.year}</span>
                                    <ul className={``}>
                                        {ys.semesters && ys.semesters.map((ss) => {
                                        return (
                                            <li>
                                                <Link
                                                    to={`/showcase/${ss.showcase.slugs.at(0)?.slug || ss.showcase.id}`}
                                                    className={`hover:underline`}
                                                >
                                                    Semester {ss.semester}
                                                </Link>
                                            </li>
                                        )})}
                                    </ul>
                                </>
                        }
                    </>
                )
            })
            }
        </div>
    )
}