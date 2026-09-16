import {Outlet} from "react-router";

console.log("API URL:")
console.log(import.meta.env.VITE_API_URL)

export function App() {

    return (
        <div className={`w-full`}>
            <div
                className={`w-full h-6 bg-r-red`}
            >
            </div>
            <div
                className={`h-30 w-full bg-r-blue flex flex-col justify-end p-4`}
            >
                <h1 className={`font-bold text-2xl text-white`}>Hub for Apple Platform Innovation Showcase</h1>
            </div>
            <main className={`h-full w-full flex flex-col items-center justify-center`}>
                <Outlet/>
            </main>


            <div className="ticks"></div>
            <section id="spacer"></section>
        </div>
    )
}

export default App
