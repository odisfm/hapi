import type {CategoryType} from "@hapi/shared/types/apiResponses";
import {Link} from "react-router";

export function CategoryListItem({data}: {data: CategoryType}) {

    return (
        <li key={data.id}>
            <Link to={`/search?categoryNames=${encodeURIComponent(data.name)}`}>
                <div className={`py-2 px-4 rounded-md bg-neutral-200 hover:bg-neutral-300`}>
                    {data.name}
                </div>
            </Link>
        </li>
    )
}