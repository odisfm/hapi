import { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section>
        <div className={`bg-pink-400`}>
          <h1>Get started</h1>
          <div
            className={`h-50 w-100 bg-r-red`}
          >
          </div>
            <div
                className={`h-50 w-100 bg-r-blue border-2 border-r-red`}
            >
            </div>
            <div
                className={`h-50 w-100 bg-r-blue-700`}
            >
            </div>
            <div
                className={`h-50 w-100 bg-r-blue-500`}
            >
            </div>
            <div
                className={`h-50 w-100 bg-r-blue-300`}
            >
            </div>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div></div>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
