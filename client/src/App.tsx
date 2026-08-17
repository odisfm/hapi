import TestApi from "./components/TestApi.tsx";

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
      <div className={`h-30 w-full flex flex-col items-center justify-center`}>
        <TestApi />
      </div>


      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
