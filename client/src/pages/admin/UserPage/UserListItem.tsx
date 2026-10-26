import type {UserDetails} from "@hapi/shared/types/apiResponses";
import {useCallback, useState} from "react";
import {Button} from "../../../components/generic/Button.tsx";
import {FaTrash} from "react-icons/fa";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import {throwErrorFromResponse} from "../../../utils/misc.ts";

export function UserListItem({user, isMe, deleteUser}: {
    user: UserDetails,
    isMe: boolean,
    deleteUser: (user: string) => void
}) {
    const [adjustCreditFormOpen, setAdjustCreditFormOpen] = useState(false);
    const modalContext = useModal();

    const setUploadCredits = useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
        const formData = new FormData(e.target!);
        const newMinutes = formData.get("creditAmount")!

        try {
            const res = await fetch(`${API_URL}/auth/user/${user.id}/video-upload-credits`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify({
                    credits: newMinutes,
                })
            })
            if (!res.ok) {
                await throwErrorFromResponse(res)
            }
        } catch (e) {
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e),
                buttons: [{id: "ok", text: "Ok", variant: "default"}]
            })
        }
    }, [modalContext, user.id])

    return (
        <li className={`flex  bg-neutral-200 hover:bg-neutral-300 rounded-md p-2`} key={user.email}>
            <div className={`flex flex-col gap-2`}>
                <span className={`font-bold`}>{user.name}</span>
                <span>{user.email}</span>
                {user.role === "STUDENT" &&
                    <div>
                        <span className={`mr-1`}>Video upload credits:</span>
                        <span className={`font-thin`}>
                                            {user.videoUploadCredits} minute{user.videoUploadCredits !== 1 ? "s" : ""}
                                        </span>
                        {adjustCreditFormOpen ?
                            <form
                                className={`flex flex-col gap-1 mt-2 font-thin max-w-50`}
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setUploadCredits(e)
                                }}
                            >
                                <label>New credit amount (minutes)</label>
                                <input
                                    id={"creditAmount"}
                                    name={"creditAmount"}
                                    type={"number"}
                                    min={0}
                                    className={`p-1 rounded-md bg-neutral-100`}
                                />
                                <Button buttonType={"submit"} variant={"compact"}>
                                    Adjust
                                </Button>
                            </form>
                            :
                            <Button
                                onClick={() => {
                                    setAdjustCreditFormOpen(true)
                                }}
                                variant={"compact"}
                                color={"subtle"}
                            >
                                Adjust credits
                            </Button>
                        }
                    </div>
                }
            </div>
            <Button
                styles={`ml-auto self-center`}
                variant={"default"}
                color={isMe ? "subtle" : "danger"}
                disabled={isMe}
                onClick={() => {
                    deleteUser(user.email)
                }}
                ariaLabel={"Delete user"}
            >
                <FaTrash/>
            </Button>
        </li>
    )

}