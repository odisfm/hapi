import {FaHeart, FaRegHeart} from "react-icons/fa6";

export function HeartButton({active, toggle}: {active: boolean, toggle: () => void}) {
    return (
        <button onClick={toggle} className={`p-1 rounded-md cursor-pointer hover:bg-neutral-300`}>
            {active ?
                <FaHeart className={`text-red-700`}/>
            :
                <FaRegHeart />
            }
        </button>
    )
}