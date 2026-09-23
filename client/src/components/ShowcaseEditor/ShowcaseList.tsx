import {useCallback, useEffect, useState} from "react";
import {API_URL} from "../../consts.ts";
import type {ShowcaseListResponse, ShowcaseListResponseItem} from "@hapi/shared/types/apiResponses";
import {ShowcaseCard} from "./ShowcaseCard.tsx";
import {getShowcaseName} from "../../utils/getShowcaseName.ts";
import {Link} from "react-router";
import {FaPlus} from "react-icons/fa";

export function ShowcaseList() {
    const [showcases, setShowcases] = useState<ShowcaseListResponseItem[]>([]);

    const getShowcases = useCallback(async () => {
        let res: Response
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
        }
    }, [])

    useEffect(() => {
        (async () => {
            await getShowcases()
        })()
    }, [getShowcases]);

    return (
        <div className={`flex flex-col gap-2`}>
            <Link to={`project/new`} className={`
                ml-auto rounded-lg bg-r-red hover:bg-r-yellow-500 text-white hover:text-black transition-colors px-4 py-2 cursor-pointer
                font-bold flex items-center gap-2 mb-4
                `}>
                <FaPlus /> <span>New showcase</span>
            </Link>
            {showcases.length > 0 && showcases.map((s) => {
                return (
                    <ShowcaseCard id={s.id} key={s.id} name={getShowcaseName(s)} publishedDate={s.publishedDate} projectCount={s._count.projects}/>
                )
            })}
        </div>
    )

}