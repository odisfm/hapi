import {FaFloppyDisk} from "react-icons/fa6";

export function SaveButton({onClick, hasChanged, styles}: {
    onClick: (e: React.MouseEvent) => void,
    hasChanged: boolean,
    styles?: string
}) {
    return (
        <button
            type={"submit"}
            onClick={onClick}
            disabled={!hasChanged}
            className={`
                ml-auto self-start rounded-md px-2 py-1  flex gap-2 items-center
                ${hasChanged ?
                `bg-r-yellow-500 hover:bg-r-yellow-400 text-black cursor-pointer`
                :
                `bg-lime-600 text-white`}
                ${styles}
            
          `}
        >
            {hasChanged ? <FaFloppyDisk/> : <></>}
            {hasChanged ? "save" : "no changes"}
        </button>
    )
}