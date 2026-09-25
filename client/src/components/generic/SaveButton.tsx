import {FaFloppyDisk} from "react-icons/fa6";
import {Button} from "./Button.tsx";

export function SaveButton({onClick, hasChanged, styles}: {
    onClick: (e: React.MouseEvent) => void,
    hasChanged: boolean,
    styles?: string
}) {
    return (
        <Button
            buttonType={"submit"}
            onClick={onClick}
            disabled={!hasChanged}
            color={"yellow"}
            styles={`
                ml-auto 
                ${!hasChanged && `!bg-lime-600 text-white`} ${styles} `}
        >
            {hasChanged ? <FaFloppyDisk/> : <></>}
            {hasChanged ? "save" : "no changes"}
        </Button>
    )
}