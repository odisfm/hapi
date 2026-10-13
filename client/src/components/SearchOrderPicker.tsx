import {type ProjectSearchSortStrategy, ProjectSearchStrategyDisplayName} from "@hapi/shared/types/apiRequests";
import {useState} from "react";
import {FaSort} from "react-icons/fa";

export function SearchOrderPicker({activeStrategy, strategies, fn}: {
    activeStrategy: ProjectSearchSortStrategy
    strategies: ProjectSearchSortStrategy[],
    fn: (strategy: ProjectSearchSortStrategy) => void
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    return (
        <div className={`relative text-sm`}>
            <button
                onClick={() => setPickerOpen(!pickerOpen)}
                className={`cursor-pointer flex items-center font-bold`}
            >
                {pickerOpen ? "Sort by" : ProjectSearchStrategyDisplayName[activeStrategy]}
                <FaSort />
            </button>
            {
                pickerOpen &&
                <ul className={`
                    absolute right-0 top-full z-10 bg-neutral-100/95 text-right 
                    whitespace-nowrap p-2 rounded-md min-w-40
                    `}>
                    {strategies.map((s) => {
                        return (
                            <li key={s}>
                                <button
                                    onClick={() => {
                                        setPickerOpen(false)
                                        fn(s)
                                    }}
                                    className={`
                                    w-full cursor-pointer hover:bg-neutral-200 text-right p-1 rounded-md
                                    ${activeStrategy === s && `font-bold`}
                                    `}
                                >
                                    {ProjectSearchStrategyDisplayName[s]}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            }
        </div>
    )
}