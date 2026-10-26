import {useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router";
import {headerLinks} from "../consts.ts";

export function Sidebar({sidebarVisible, setSidebarVisible}: {
    sidebarVisible: boolean,
    setSidebarVisible: (visible: boolean) => void
}) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { setSidebarVisible(false); }, [location.pathname, setSidebarVisible]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarVisible(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [setSidebarVisible]);

    return (
        <div
            inert={!sidebarVisible}
            className={`
                fixed z-40 h-dvh overflow-hidden
                bg-r-blue-700 text-white 
                motion-safe:transition-[width,visibility] duration-50 ease-in-out
                ${sidebarVisible ? "w-full visible" : "w-0 invisible"}
            `}
        >
            <nav className="w-full whitespace-nowrap p-6">
                <h2 className={`font-bold text-3xl`}>Quick links</h2>
                <ul className={`flex flex-col gap-2 mt-4`}>
                    {headerLinks.map(link => (
                        <li
                            key={link.path}
                            className={`text-2xl hover:underline`}
                        >
                            <Link to={link.path}>{link.label}</Link>
                        </li>
                    ))}
                </ul>
                <form
                    className={`flex flex-col gap-2 mt-4`}
                    onSubmit={e => {
                        e.preventDefault()
                        const formData = new FormData(e.target)
                        const searchTerm = formData.get("search")
                        if (!searchTerm) return;
                        navigate(`/search?q=${encodeURIComponent(searchTerm as string)}`)
                    }}>
                    <label htmlFor={"search"}>Search apps</label>
                    <input name={"search"} id={"search"} className={`text-white bg-r-blue p-1 rounded-md max-w-100`}/>
                </form>
            </nav>
        </div>
    );
}