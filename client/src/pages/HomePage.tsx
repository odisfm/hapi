export default function HomePage() {
    return (
        <div className="-mt-8 w-full">
            <section className="relative left-1/2 h-[22.5rem] w-screen -translate-x-1/2 overflow-hidden bg-r-red">
                <div className="absolute inset-0 bg-r-red" aria-hidden="true" />
            </section>

            <section className="w-full bg-white py-12 text-black sm:py-16">
                <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-16">
                    <h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-[-0.02em]">
                        Hub for Apple Platform Innovation (HAPI) <br className="hidden lg:block" />@ RMIT
                    </h1>

                    <div className="text-[1rem] leading-[1.3] tracking-normal text-body-text-gray">
                        <p>
                            Welcome to RMIT&apos;s Hub for Apple Platform Innovation (HAPI), where cutting-edge technology meets transformative learning. Nestled at the intersection of education and industry, HAPI is dedicated to exploring novel computing platforms and mastering the mobile app economy. By fostering a collaborative environment that works closely with Apple and its partners, HAPI enriches student experiences and empowers them to make impactful contributions in the tech industry.
                        </p>
                        <p className="mt-4">
                            HAPI is a vibrant centre for both teaching and research. We offer a unique curriculum that integrates Apple&apos;s latest design frameworks and developer tools, providing students with hands-on opportunities to develop expertise in app development and design for Apple platforms. Our teaching efforts are encapsulated in the &apos;Design &amp; Develop for Apple Platforms&apos; minor, featuring courses like &quot;UI and UX for Apple Platforms&quot; and &quot;Getting started with iOS App Development&quot;, which are available to all undergraduate students across RMIT.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}