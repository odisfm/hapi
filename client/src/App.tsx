import {Outlet, useLocation} from "react-router";
import {type ReactNode, useEffect, useState} from "react";
import {Header} from "./components/Header.tsx";
import {Footer} from "./components/Footer.tsx";
import {Sidebar} from "./components/Sidebar.tsx";

export function App({children}: {children?: ReactNode}) {
    const currentLocation = useLocation();
    const isAdminPage = currentLocation.pathname === "/admin-login" || currentLocation.pathname === "/dashboard";
    const [sidebarVisible, setSidebarVisible] = useState(false);

    useEffect(() => {
        if (!sidebarVisible) return;
        const html = document.documentElement;
        const prev = html.style.overflow;
        html.style.overflow = "hidden";
        return () => { html.style.overflow = prev; };
    }, [sidebarVisible]);

    return (
        <div className={`w-full font-copy`}>
            <Header sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />
            <div>
                <Sidebar sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />
                <main className={`
                h-full w-full flex flex-col items-center 
                bg-neutral-100
                `}>
                    <div className={`
                        max-w-[1000px] w-full md:w-4/5
                        px-4 pb-12 pt-8 
                    `}>
                        <Outlet/>
                        {children}
                    </div>
                </main>
            </div>
            {!isAdminPage &&
                <Footer/>
            }
        </div>
    )
}

export default App
