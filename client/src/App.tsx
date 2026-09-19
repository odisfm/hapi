import {Link, Outlet, useLocation} from "react-router";
import {MdSearch} from "react-icons/md";
import {useAuth} from "./contexts/auth/useAuth.ts";

export function App() {
    const authenticationContext = useAuth()
    const currentLocation = useLocation();
    const isAdminPage = currentLocation.pathname === "/admin-login" || currentLocation.pathname === "/dashboard";

    return (
        <div className={`w-full font-copy`}>
            <div
                className={`w-full bg-[#D1D1D6] text-black`}
            >
                {authenticationContext.user &&
                    <div className={`flex items-center gap-2 px-4 py-2 bg-r-blue text-white`}>
                        <span className={`ml-auto hidden text-sm md:inline`}>
                            Hello, <span className={`font-bold`}>{authenticationContext.user.name}</span>
                        </span>
                        <Link
                            to="/dashboard"
                            className={`rounded-md bg-r-red px-2 py-1 text-sm font-bold text-white hover:bg-r-blue-700`}>
                            dashboard
                        </Link>
                    </div>
                }
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
            <main className={`h-full w-full flex flex-col items-center justify-center px-4 pb-12 pt-8 bg-neutral-100`}>
                <Outlet/>
            </main>
            {!isAdminPage &&
                <footer className="w-full bg-[#D1D1D6] text-xs text-black">
                    <div className="mx-auto max-w-[1416px] px-10 py-12 sm:py-16">
                        <div className="flex items-center gap-2">
                            <img
                                src="/rmit-logo-red.png"
                                alt="RMIT"
                                className="h-6 w-6 flex-shrink-0 object-contain"
                            />
                            <span className="text-base font-bold">
                                RMIT HAPI -
                            </span>
                        </div>
                        <h2 className="text-base font-bold leading-tight">
                            Hub for Apple Innovation.
                        </h2>
                        <p className="mt-2 max-w-[290px] leading-5">
                            HAPI enriches student experiences and empowers them to make
                            impactful contributions to the tech industry.
                        </p>
                    </div>
                    <div className="h-6 w-full bg-[#000054]" />
                </footer>
            }
        </div>
    )
}

export default App
