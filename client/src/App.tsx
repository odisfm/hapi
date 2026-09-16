import {Link, Outlet} from "react-router";
import {useAuth} from "./contexts/auth/useAuth.ts";
import {API_URL} from "./consts.ts";

console.log("API URL:")
console.log(API_URL)

export function App() {
    const authContext = useAuth()

    return (
        <div className={`w-full`}>
            <div
                className={`w-full bg-r-red flex gap-2 p-2 items-center`}
            >
                {authContext.user &&
                    <>
                        <span className={`text-sm text-white ml-auto`}>
                            Hello, <span className={"font-bold"}>{authContext.user.name}</span>
                        </span>
                        <Link
                            to="/dashboard"
                            className={`font-bold text-white rounded-md bg-r-blue-700 hover:bg-r-blue py-1 px-2`}>
                            dashboard
                        </Link>
                    </>
                }
            </div>
            <div
                className={`h-30 w-full bg-r-blue flex flex-col justify-end p-4`}
            >
                <Link to={"/"}>
                    <h1 className={`font-bold text-2xl text-white hover:underline`}>
                        Hub for Apple Platform Innovation Showcase
                    </h1>
                </Link>
            </div>
            <main className={`h-full w-full flex flex-col items-center justify-center p-4`}>
                <Outlet/>
            </main>


            <div className="ticks"></div>
            <section id="spacer"></section>
        </div>
    )
}

export default App
