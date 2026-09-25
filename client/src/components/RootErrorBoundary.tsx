import {isRouteErrorResponse, Link, useNavigate, useRouteError} from "react-router";
import App from "../App.tsx";
import {Button} from "./generic/Button.tsx";

export function RootErrorBoundary() {
    const error = useRouteError()
    const navigate = useNavigate();
    if (isRouteErrorResponse(error)) {
        return (
            <App>
                <div className={`w-80 mt-20`}>
                    <h1
                        className={`text-5xl font-normal mb-6`}
                    >
                        Error 404
                    </h1>
                    <p className={`text-2xl mb-12`}>
                        This page wandered off.
                        <br/>
                        Let's take you back.
                    </p>
                    <Button
                        onClick={() => navigate("/")}
                        variant={"hero"}
                    >
                        HOME PAGE
                    </Button>
                </div>
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