import {isRouteErrorResponse, Link, useRouteError} from "react-router";
import App from "../App.tsx";
import {Error404} from "../pages/Error404.tsx";

export function RootErrorBoundary() {
    const error = useRouteError()
    if (isRouteErrorResponse(error)) {
        return (
            <App>
                <Error404 />
            </App>
        )
    } else {
        return (
            <div
                className={`
                w-[100dvw] h-[100dvh] bg-neutral-200 flex flex-col items-center justify-center
                `}>
                <div className={`flex flex-col items-center gap-2 mt-[-20%]`}>
                    <h1
                        className={`text-5xl font-normal mb-6`}
                    >
                        An error occurred
                    </h1>
                    <Link
                        to={"/"}
                        className={`
                        min-w-48 shrink-0 rounded-full bg-r-blue px-16 py-3 text-center text-sm 
                        font-bold text-white font-copy cursor-pointer
                        `}
                    >
                        HOME PAGE
                    </Link>
                </div>
            </div>
        )
    }
}