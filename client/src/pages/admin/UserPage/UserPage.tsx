import type {UserDetails, UserListResponse} from "@hapi/shared/types/apiResponses";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import {UserList} from "./UserList.tsx";
import {Button} from "../../../components/generic/Button.tsx";
import {useNavigate} from "react-router";
import {FaPlus} from "react-icons/fa";
import {Spinner} from "../../../components/generic/Spinner.tsx";

export function UserPage() {
    const [loading, setLoading] = useState(false);
    const [userList, setUserList] = useState<UserDetails[]>([]);
    const modalContext = useModal();
    const navigate = useNavigate();

    const getUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/auth/users`, {
                credentials: "include"
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText);
            }
            const json: UserListResponse = await res.json();
            setUserList(json.users)
        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        } finally {
            setLoading(false);
        }
    }, [modalContext])

    const deleteUser = useCallback(async (email: string) => {
        const confirm = await modalContext.dispatchModal({
            headline: "Delete user?",
            body: `User with email ${email} will be deleted immediately.`,
            buttons: [
                {id: "cancel", text: "Cancel", variant: "default"},
                {id: "confirm", text: "Delete user", variant: "danger"},
            ]
        })
        if (confirm !== "confirm") return
        try {
            const res = await fetch(`${API_URL}/auth/user`, {
                method: "DELETE",
                credentials: "include",
                body: JSON.stringify({
                    email
                })
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText);
            }
            getUsers()
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [modalContext, getUsers])

    useEffect(() => {
        (async () => {
            getUsers()
        })()
    }, [getUsers])

    const {adminUsers, studentUsers} = useMemo(() => {
        const adminUsers: UserDetails[] = []
        const studentUsers: UserDetails[] = []

        for (const user of userList) {
            if (user.role === "ADMIN") adminUsers.push(user)
            else if (user.role === "STUDENT") studentUsers.push(user)
        }

        return {adminUsers, studentUsers}
    }, [userList])

    return (
        <div className={`flex flex-col gap-4`}>
            <div className={`flex items-center`}>
                <div className={`flex items-center gap-2`}>
                    <h3 className={`font-bold text-3xl uppercase`}>Users</h3>
                    {loading && <Spinner /> }
                </div>
                <Button
                    color={"red"}
                    styles={`ml-auto`}
                    onClick={() => navigate("/dashboard/users/create")}
                >
                    <FaPlus />
                    Create user
                </Button>
            </div>
            {!loading &&
                <>
                    <UserList users={adminUsers} heading={"Admins"} deleteUser={deleteUser}/>
                    <UserList users={studentUsers} heading={"Students"} deleteUser={deleteUser}/>
                </>
            }
        </div>
    )
}