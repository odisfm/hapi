import {Link} from "react-router";

export function Footer() {
    return (
        <footer className="w-full bg-r-blue text-xs text-white">
            <div className="mx-auto flex max-w-[1416px] flex-col justify-between gap-8 px-10 py-12 sm:py-16 md:flex-row md:items-start">
                <div>
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
                <Link
                    to="/admin-login"
                    className="text-base font-bold leading-5 text-white hover:text-r-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Admin Login
                </Link>
            </div>
        </footer>
    )
}