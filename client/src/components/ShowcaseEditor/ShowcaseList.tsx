import {useCallback, useEffect, useState} from "react";
import {API_URL} from "../../consts.ts";
import type {ShowcaseListResponse, ShowcaseListResponseItem} from "@hapi/shared/types/apiResponses";
import {ShowcaseCard} from "./ShowcaseCard.tsx";
import {getShowcaseName} from "../../utils/getShowcaseName.ts";
import {Link} from "react-router";
import {FaPlus, FaSpinner} from "react-icons/fa";

export function ShowcaseList() {
    const [showcases, setShowcases] = useState<ShowcaseListResponseItem[]>([]);
    const [loading, setLoading] = useState(true);

    const getShowcases = useCallback(async () => {
        let res: Response
        setLoading(true)
        try {
            res = await fetch(`${API_URL}/showcase/all`, {
                credentials: "include"
            })
            const json: ShowcaseListResponse = await res.json();
            setShowcases(json.showcases.sort((a, b) => {
                if (a.name < b.name) return -1
                if (a.name > b.name) return 1;
                if (a.year > b.year) return -1;
                if (a.year < b.year) return -1;
                if (a.semester < b.semester) return -1;
                if (a.semester > b.semester) return 1;
                return 0;
            }));
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        (async () => {
            await getShowcases()
        })()
    }, [getShowcases]);

    return (
        <div className={`flex flex-col gap-2 w-full`}>
            <div className={`w-full flex items-center gap-2`}>
                <h2 className={`font-bold text-3xl`}>SHOWCASES</h2>
                {loading && <FaSpinner className={`animate-spin`}/>}
                <Link to={`/dashboard/showcase/new`} className={`
                ml-auto rounded-lg bg-r-red hover:bg-r-yellow-500 text-white hover:text-black transition-colors px-4 py-2 cursor-pointer
                font-bold flex items-center gap-2 mb-4
                `}>
                    <FaPlus/> <span>New showcase</span>
                </Link>
            </div>
            {showcases.length > 0 && showcases.map((s) => {
                return (
                    <ShowcaseCard id={s.id} key={s.id} name={getShowcaseName(s)} publishedDate={s.publishedDate} projectCount={s._count.projects}/>
                )
            })}
        </div>
    )

}