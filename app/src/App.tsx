import { helloWorld } from './api'
import { TxnListDisplay, TxnProvider } from './components'

function App() {
  const toggleDarkMode = () => {
    localStorage.theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = localStorage.theme
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center">
      <h1
        className="mt-5 text-center text-3xl font-bold"
        onClick={toggleDarkMode}
      >
        Demo Banking App
      </h1>
      <div className="w-full h-[64rem] px-4">
        <TxnProvider>
          <TxnListDisplay />
        </TxnProvider>
      </div>
      <div className="prose">
        <p>
          {helloWorld()}
          {
            " This app was made by somehow who literally doesn't do finance tracking so pardon if it seems weird."
          }
        </p>
      </div>
    </div>
  )
}

export default App
