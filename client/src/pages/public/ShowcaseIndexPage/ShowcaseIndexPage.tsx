import {useCallback, useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import {API_URL} from "../../../consts.ts";
import {throwErrorFromResponse} from "../../../utils/misc.ts";
import {buildConsolidatedShowcases, type ConsolidatedShowcaseType} from "./types.ts";
import type {ShowcaseListResponse} from "@hapi/shared/types/apiResponses";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {ShowcaseItem} from "./ShowcaseItem.tsx";

export function ShowcaseIndexPage() {
    const modalContext = useModal();
    const [loading, setLoading] = useState(true);
    const [showcases, setShowcases] = useState<ConsolidatedShowcaseType[]>([])

    const getShowcases = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/showcase/all`, {
                method: "GET",
                credentials: "omit"
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            const json: ShowcaseListResponse = await res.json();
            console.log(json);
            setShowcases(buildConsolidatedShowcases(json.showcases.filter((s) => {
                return s._count.projects
            })))
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        } finally {
            setLoading(false);
        }
    }, [modalContext])

    useEffect(() => {
        (async () => {
           getShowcases()
        })()
    }, [getShowcases])

    console.log({showcases})
    
    return (
        <div className={`flex flex-col gap-4 w-full max-w-5xl md:px-4`}>
            <div className={`flex items-center gap-2`}>
                <h1 className={`text-3xl font-headline font-bold`}>Showcases</h1>
                {loading && <FaSpinner className={`animate-spin text-xl`} />}
            </div>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, architecto, blanditiis consequuntur debitis distinctio doloremque doloribus ea error ex exercitationem iste laudantium molestias nisi odit omnis optio, perspiciatis placeat provident qui repellat sapiente sed sequi sint sit sunt tenetur totam.</p>

            <div className={`mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`}>
                {showcases.map((s, i) => {
                    return (
                        <ShowcaseItem data={s} key={i} />
                    )
                })}
            </div>

        </div>
    )
}