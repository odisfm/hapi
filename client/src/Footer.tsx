export function Footer() {
    return (
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
    )
}