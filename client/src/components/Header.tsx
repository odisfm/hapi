import {MdSearch} from "react-icons/md";
import SearchOverlay from "./SearchOverlay.tsx";
import {useAuth} from "../contexts/auth/useAuth.ts";
import {Link, useLocation} from "react-router";
import {useMemo, useState} from "react";
import {headerLinks, type HeaderLinkType} from "../consts.ts";
import {Button} from "./generic/Button.tsx";
import {GiHamburgerMenu} from "react-icons/gi";

type View = HeaderLinkType["path"] | null

const pillStyles = `px-4 py-1 uppercase`
const activePillStyles = `bg-r-red text-white rounded-2xl`

export function Header({sidebarVisible, setSidebarVisible}: {
    sidebarVisible: boolean,
    setSidebarVisible: (visible: boolean) => void
}) {
    const authenticationContext = useAuth()
    const [searchOpen, setSearchOpen] = useState(false);
    const currentLocation = useLocation();


    const activeView: View = useMemo(() => {
        const match = headerLinks.find(link =>
            currentLocation.pathname.startsWith(link.path)
        )
        return match?.path ?? null
    }, [currentLocation.pathname])

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
                <nav className={`hidden items-center text-md font-normal sm:flex justify-end gap-4`}>
                    {headerLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`${pillStyles} ${activeView === link.path ? activePillStyles : ""}`}
                            role={"link"}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button
                        type="button"
                        aria-label="Search"
                        onClick={() => setSearchOpen(!searchOpen)}
                        className={`text-4xl hover:text-r-red cursor-pointer`}
                    >
                        <MdSearch />
                    </button>
                </nav>
                <Button
                    color={"subtle"}
                    styles={`visible sm:hidden`}
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                >
                    <GiHamburgerMenu className={`${sidebarVisible && `rotate-90`} text-3xl`}/>
                </Button>
            </div>
            {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
        </header>
    )
}