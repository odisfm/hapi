import {Outlet, useLocation} from "react-router";
import {type ReactNode} from "react";
import {Header} from "./Header.tsx";
import {Footer} from "./Footer.tsx";

export function App({children}: {children?: ReactNode}) {
    const currentLocation = useLocation();
    const isAdminPage = currentLocation.pathname === "/admin-login" || currentLocation.pathname === "/dashboard";

    return (
        <div className={`w-full font-copy`}>
            <Header />
            <main className={`h-full w-full flex flex-col items-center px-4 pb-12 pt-8 bg-neutral-100`}>
                <Outlet/>
                {children}
            </main>
            {!isAdminPage &&
                <Footer/>
            }
        </div>
    )
}

export default App
