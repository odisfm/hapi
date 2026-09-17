import {Link, Outlet} from "react-router";
import {MdSearch} from "react-icons/md";
import {useAuth} from "./contexts/auth/useAuth.ts";

export function App() {
    const authenticationContext = useAuth()

    return (
        <div className={`w-full`}>
            <div
                className={`w-full bg-[#D1D1D6] text-black`}
            >
                <div className={`mx-auto flex w-full max-w-[calc(64rem+2rem)] items-center justify-between px-4 py-6 sm:grid sm:grid-cols-[1fr_auto_1fr]`}>
                    <Link to="/" className={`flex shrink-0 items-center gap-3`}>
                        <img
                            src="/rmit-logo.png"
                            alt="RMIT"
                            className={`h-8 w-8 object-contain`}
                        />
                        <span className={`text-3xl font-bold tracking-wide`}>HAPI</span>
                    </Link>
                    <nav className={`hidden items-center gap-16 text-base font-bold sm:flex`}>
                        <Link to="/#applications" className={`hover:text-r-red`}>APPLICATIONS</Link>
                        <Link to="/#categories" className={`hover:text-r-red`}>CATEGORIES</Link>
                    </nav>
                    <div className={`flex items-center gap-3 sm:w-full sm:justify-end`}>
                        {authenticationContext.user &&
                            <>
                                <span className={`hidden text-sm md:inline`}>
                                    Hello, <span className={`font-bold`}>{authenticationContext.user.name}</span>
                                </span>
                                <Link
                                    to="/dashboard"
                                    className={`rounded-md bg-r-blue px-2 py-1 text-sm font-bold text-white hover:bg-r-blue-700`}>
                                    dashboard
                                </Link>
                            </>
                        }
                        <button
                            type="button"
                            aria-label="Search"
                            className={`text-4xl hover:text-r-red`}
                        >
                            <MdSearch />
                        </button>
                    </div>
                </div>
            </div>
            <main className={`h-full w-full flex flex-col items-center justify-center px-4 pb-4 pt-8`}>
                <Outlet/>
            </main>


            <div className="ticks"></div>
            <section id="spacer"></section>
        </div>
    )
}

export default App
