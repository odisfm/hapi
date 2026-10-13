import type {CategoryType} from "@hapi/shared/types/apiResponses";
import {Button} from "../generic/Button.tsx";
import { FaTrash } from "react-icons/fa";
import {useEffect, useRef, useState} from "react";
import {FaPencil} from "react-icons/fa6";
import {MdCancel, MdCheckCircle} from "react-icons/md";

const buttonStyles = `text-xs`

export function CategoryItem({data, deleteFn, renameFn}: {
    data: CategoryType,
    deleteFn: (id: string) => void,
    renameFn: (id: string, name: string) => void,
}) {
    const [renaming, setRenaming] = useState(false)
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renaming && renameInputRef.current) {
            renameInputRef.current.focus()
        }
    }, [renaming])

    return (
        <li className={`flex p-4 rounded-md bg-neutral-200`}>
            <div className={`flex flex-col`}>
                {!renaming ?
                    <span className={`font-bold`}>{data.name}</span>
                    :
                    <form
                        className={`mb-2 flex items-center gap-1`}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const newName = formData.get("name");
                            if (!newName) return
                            renameFn(data.id, String(newName));
                            setRenaming(false)
                        }}
                    >
                        <input
                            name={"name"}
                            className={`rounded-md p-1 bg-neutral-300`}
                            defaultValue={data.name}
                            ref={renameInputRef}
                        />
                        <Button
                            color={"mid-blue"}
                            buttonType={"submit"}
                            ariaLabel={"submit rename"}
                        >
                            <MdCheckCircle/>
                        </Button>
                    </form>
                }
                <span className={`text-sm`}>{data.projectCount} project{data.projectCount !== 1 ? "s" : ""}</span>
            </div>
            <div className={`flex flex-col gap-1 ml-auto`}>
                <Button
                    color={renaming ? "yellow" : "blue"}
                    variant={"compact"}
                    styles={buttonStyles}
                    ariaLabel={renaming ? "cancel rename" : "rename"}
                    onClick={() => {
                        setRenaming(!renaming)
                    }}
                >
                    {renaming ? <MdCancel /> : <FaPencil/>}
                </Button>
                <Button
                    color={"danger"}
                    variant={"compact"}
                    styles={buttonStyles}
                    ariaLabel={"delete category"}
                    onClick={() => deleteFn(data.id)}
                >
                    <FaTrash />
                </Button>
            </div>
        </li>
    )
}