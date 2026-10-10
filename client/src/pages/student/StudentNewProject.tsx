import {useCallback, useEffect, useState} from "react";
import {API_URL} from "../../consts.ts";
import {useModal} from "../../contexts/modal/useModal.ts";
import {useNavigate} from "react-router";
import type {CreateProjectResponse, ShowcaseListResponse} from "@hapi/shared/types/apiResponses";
import {getShowcaseName} from "@hapi/shared/utils/getShowcaseName";
import {Button} from "../../components/generic/Button.tsx";
const fieldsetStyles = `flex flex-col gap-2 items-start`

export function StudentNewProject() {
    const modalContext = useModal()
    const navigate = useNavigate();
    const [showcases, setShowcases] = useState<ShowcaseListResponse["showcases"]>([]);

    const getShowcases = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/showcase/all`, {
                credentials: "include",
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            const json: ShowcaseListResponse = await res.json();
            setShowcases(json.showcases)

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
            navigate("/student")
        }
    }, [modalContext, navigate])

    useEffect(() => {
        (async () => {
           getShowcases()
        })()
    }, [getShowcases])

    async function submitForm(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target)
        try {
            const res = await fetch(`${API_URL}/project`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    showcaseId: formData.get("showcase")
                })
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }

            const json: CreateProjectResponse = await res.json();
            navigate(`/student/project/${json.versionId}`)

        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
            navigate("/student")
        }

    }

    return (
        <div className={`flex flex-col gap-4 p-4 w-full md:w-4/5 lg:w-2/3 xl:w-3/5 2xl:w-2/5`}>
            <h2 className={`text-2xl font-headline font-bold`}>Create new project</h2>
            <form onSubmit={(e) => {
                submitForm(e)
            }}>
                <div className={fieldsetStyles}>
                    <label htmlFor={"showcase"} className={`text-xl`}>Showcase</label>
                    <select
                        id={"showcase"}
                        name={"showcase"}
                        className={`px-2 py-1 bg-white rounded-md`}
                        required={true}
                    >
                        {showcases.map((showcase) => {
                            return (
                                <option value={showcase.id} key={showcase.id}>
                                    {getShowcaseName(showcase)}
                                </option>
                            )
                        })}
                    </select>

                    <p className={`p-4 rounded-sm bg-r-blue-700 text-white mt-4`}>
                        Can't be changed after creation. If unsure, check with teaching staff.
                    </p>
                </div>

                <Button
                    color={"red"}
                    buttonType={"submit"}
                    styles={"mt-8"}
                >
                    Create project
                </Button>

            </form>
        </div>
    )
}