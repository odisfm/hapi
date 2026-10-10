import type {UserDetails} from "@hapi/shared/types/apiResponses";
import {useAuth} from "../../contexts/auth/useAuth.ts";
import {FaTrash} from "react-icons/fa";
import {Button} from "../generic/Button.tsx";

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
                    return (
                        <li className={`flex  bg-neutral-200 hover:bg-neutral-300 rounded-md p-2`} key={user.email}>
                            <div className={`flex flex-col gap-2`}>
                                <span className={`font-bold`}>{user.name}</span>
                                <span>{user.email}</span>
                            </div>
                            <Button
                                styles={`ml-auto self-center`}
                                variant={"default"}
                                color={isMe ? "subtle" : "danger"}
                                disabled={isMe}
                                onClick={() => {deleteUser(user.email)}}
                            >
                                <FaTrash />
                            </Button>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}