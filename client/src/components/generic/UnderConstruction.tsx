import {IoHammerSharp} from "react-icons/io5";

export function UnderConstruction() {
    return (
        <div className={`flex gap-1 items-center`}>
            <h3 className={`font-bold text-xl`}>UNDER CONSTRUCTION</h3>
            <IoHammerSharp className={`animate-spin`}/>
        </div>
    )
}
