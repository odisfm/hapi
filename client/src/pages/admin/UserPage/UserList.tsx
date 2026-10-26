import type {UserDetails} from "@hapi/shared/types/apiResponses";
import {useAuth} from "../../../contexts/auth/useAuth.ts";
import {UserListItem} from "./UserListItem.tsx";

export function UserList({users, heading, deleteUser}: {
    users: UserDetails[],
    heading: string,
    deleteUser: (user: string) => void
}) {
    const authContext = useAuth()

    return (
        <>
            <h4 className={`font-bold uppercase`}>{heading}</h4>
            <ul className={`flex flex-col gap-2`}>
                {users.map((user: UserDetails) => {
                    const isMe = user.email === authContext.user?.email
                    return <UserListItem user={user} isMe={isMe} deleteUser={deleteUser} />
                })}
            </ul>
        </>
    )
}