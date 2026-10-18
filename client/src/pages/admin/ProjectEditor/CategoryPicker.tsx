import type {ProjectAdminType} from "@hapi/shared/types/project";
import type {Category} from "@hapi/shared/prisma/client";
import {useCallback} from "react";

type Props = {
    categories: Category[];
    project: ProjectAdminType,
    setProject: (newProject: ProjectAdminType) => void,
    setHasChanged: (newHasChanged: boolean) => void,
}

export function CategoryPicker({categories, project, setProject, setHasChanged}: Props) {

    const toggleCategory = useCallback((categoryName: string) => {
        const categoryIdx = project.categories.indexOf(categoryName);
        if (categoryIdx >= 0) {
            setProject({
                ...project,
                categories: project.categories.toSpliced(categoryIdx, 1),
            })
        } else {
            setProject({
                ...project,
                categories: [...project.categories, categoryName],
            })
        }
        setHasChanged(true)
    }, [project, setProject])

    return (
        <ul className={`flex flex-wrap gap-2 max-w-120`}>
            {categories.map((category: Category) => {
                const isActive = project.categories.includes(category.name)
                return <li
                    key={category.id}
                    className={`
                    p-1 rounded-md ${isActive ? `bg-r-blue-500 text-white` : `bg-neutral-200`} text-sm
                    `}
                >
                    <button
                        type="button"
                        className={`cursor-pointer`}
                        onClick={() => {
                            toggleCategory(category.name);
                        }}
                    >
                        {category.name}
                    </button>
                </li>
            })}
        </ul>
    )
}