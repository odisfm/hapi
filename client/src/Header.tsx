import {MdSearch} from "react-icons/md";
import SearchOverlay from "./components/SearchOverlay.tsx";
import {useAuth} from "./contexts/auth/useAuth.ts";
import {Link, useLocation} from "react-router";
import {useMemo, useState} from "react";

type View = "applications" | "categories" | null

const pillStyles = `px-4 py-1`
const activePillStyles = `bg-r-red text-white rounded-2xl`

export function Header() {
    const authenticationContext = useAuth()
    const [searchOpen, setSearchOpen] = useState(false);
    const currentLocation = useLocation();


    const activeView: View = useMemo(() => {
        if (currentLocation.pathname.startsWith("/search")) {
            return "applications"
        }
        return null
        if (currentLocation.pathname.startsWith("/categories")) {
            return "categories"
        }
        return null
    }, [currentLocation])

    return (
        <header
            className={`sticky top-0 z-30 w-full bg-white text-black`}
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
            <div className={`mx-auto flex w-full max-w-[calc(64rem+2rem)] items-center justify-between px-4 py-4 sm:grid sm:grid-cols-[1fr_auto]`}>
                <Link to="/" className={`flex shrink-0 items-center gap-3 justify-self-start`}>
                    <img
                        src="/rmit-logo-red.png"
                        alt="RMIT"
                        className={`h-12 w-12 object-contain`}
                    />
                    <span className={`
                    text-3xl font-headline font-bold tracking-wide text-white bg-r-red px-4 py-2
                    `}>
                        HAPI
                    </span>
                </Link>
                <nav className={`hidden items-center text-md font-thin sm:flex justify-end gap-4`}>
                    <div className={`flex items-center gap-0.5`}><Link
                        to="/search"
                        className={`${pillStyles} ${activeView === "applications" && activePillStyles}`}
                    >
                        APPLICATIONS
                    </Link>
                        <Link
                            to="/#categories"
                            className={`${pillStyles} ${activeView === "categories" && activePillStyles}`}
                        >
                            CATEGORIES
                        </Link></div>
                    <button
                        type="button"
                        aria-label="Search"
                        onClick={() => setSearchOpen(!searchOpen)}
                        className={`text-4xl hover:text-r-red cursor-pointer`}
                    >
                        <MdSearch />
                    </button>
                </nav>
            </div>
            {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
        </header>
    )
}