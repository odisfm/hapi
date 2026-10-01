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
                <footer className="w-full bg-r-blue text-xs text-white">
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
                </footer>
            }
        </div>
    )
}

export default App
