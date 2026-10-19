import type {ConsolidatedShowcaseType} from "./types.ts";
import {Link} from "react-router";
import {Fragment} from "react";

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
                    <Fragment key={ys.year}>
                        {
                            ys.showcase ?
                                <Link
                                    to={`/showcase/${ys.showcase.slugs.at(0)?.slug || ys.showcase.id}`}
                                    className={`text-lg font-bold hover:underline`}
                                    key={ys.showcase.id}
                                >
                                    {ys.year}
                                </Link>
                                :
                                <>
                                <span className={`font-bold text-lg`}>{ys.year}</span>
                                    <ul className={``}>
                                        {ys.semesters && ys.semesters.map((ss) => {
                                        return (
                                            <li key={ss.showcase.id}>
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
                    </Fragment>
                )
            })
            }
        </div>
    )
}