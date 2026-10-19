import {FaSpinner} from "react-icons/fa";

export function Spinner({className = ""}: {className?: string}) {
    return (
        <FaSpinner className={`${className} text-xl animate-spin`} />
    )
}