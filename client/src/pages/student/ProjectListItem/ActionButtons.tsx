import type {Action} from "./ProjectListItem.tsx";
import {Button} from "../../../components/generic/Button.tsx";
import {FaEdit, FaTrash} from "react-icons/fa";
import {MdCancel} from "react-icons/md";

type Props = {
    actions: Set<Action>,
    editFn: () => void,
    deleteFn: () => void,
    withdrawFn: () => void,
    reviseFn: () => void,
}

export function ActionButtons({actions, editFn, deleteFn, withdrawFn, reviseFn}: Props) {

    return (
        <div className={`flex gap-1 items-center`}>
            {
                actions.has("edit") &&
                <Button onClick={editFn} color={"mid-blue"} variant={"compact"}>
                    <FaEdit />
                    Edit
                </Button>
            }
            {
                actions.has("revise") &&
                <Button onClick={reviseFn} color={"mid-blue"} variant={"compact"}>
                    <FaEdit />
                    Revise
                </Button>
            }
            {
                actions.has("withdraw") &&
                <Button onClick={withdrawFn} color={"yellow"} variant={"compact"}>
                    <MdCancel />
                    Withdraw
                </Button>
            }
            {
                actions.has("delete") &&
                <Button onClick={deleteFn} color={"danger"} variant={"compact"}>
                    <FaTrash />
                    Delete
                </Button>
            }
        </div>
    )
}