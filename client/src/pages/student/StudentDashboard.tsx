import {Button} from "../../components/generic/Button.tsx";
import {useAuth} from "../../contexts/auth/useAuth.ts";
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useModal} from "../../contexts/modal/useModal.ts";
import {FaPlus} from "react-icons/fa";
import type {ProjectVersionSummaryType} from "@hapi/shared/types/project";
import {API_URL} from "../../consts.ts";
import type {ProjectVersionsSearchResponse} from "@hapi/shared/types/apiResponses";
import {ProjectListItem} from "./ProjectListItem/ProjectListItem.tsx";
import {throwErrorFromResponse} from "../../utils/misc.ts";

export function StudentDashboard() {
    const authContext = useAuth()
    const modalContext = useModal()
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectVersionSummaryType[]>([])

    useEffect(() => {
        if (!authContext.user && !authContext.authPending) {
            navigate("/admin-login");
        } else if (!authContext.authPending && authContext.user?.role !== "STUDENT") {
            navigate("/protected")
        }
    }, [authContext.user, authContext.authPending, navigate]);

    const getVersions = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/project/versions`, {
                credentials: "include"
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            const json: ProjectVersionsSearchResponse = await res.json()
            setProjects(json.versions.map((v) => {
                if (v.alternateVersion?.status === "SUPERSEDED") {
                    return {...v, alternateVersion: undefined}
                }
                return v
            }))
        } catch (e) {
            console.error(e)
            return await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [modalContext])

    useEffect(() => {
        (async () => {
            getVersions()
        })()
    }, [getVersions]);


    return (
        <div className={`flex flex-col gap-4 p-4 w-full md:w-4/5 lg:w-2/3 xl:w-3/5 2xl:w-2/5`}>
            <h1 className={`self-start font-headline font-bold text-5xl`}>Student Dashboard</h1>
            {authContext.user &&
                <div className={`flex gap-1 items-center`}>
                    <span>Logged in as {authContext.user.name}.</span>
                    <Button
                        variant={"compact"}
                        color={"red"}
                        onClick={() => {authContext.logOut()}}
                    >
                        Log out.
                    </Button>
                </div>


            }
            <Button color={"red"} onClick={() => {navigate("/student/new-project")}}>
                <FaPlus />
                New Project
            </Button>

            <h3>Projects</h3>
            <ul className={`flex flex-col gap-2 self-start w-full max-w-100`}>
                {projects.map((p) => {
                    return (<ProjectListItem summary={p} refresh={getVersions} key={p.projectId}/>)
                })}
            </ul>

        </div>
    )
}