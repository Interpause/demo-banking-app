import { helloWorld } from './api'
import { TxnListDisplay, TxnProvider } from './components'

function App() {
  const toggleDarkMode = () => {
    localStorage.theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = localStorage.theme
  }

  return (
    <div className="absolute inset-0 m-auto prose flex flex-col">
      <h1 className="mt-5 text-center" onClick={toggleDarkMode}>
        Demo Banking App
      </h1>
      <div className="w-full h-[64rem] px-4">
        <TxnProvider>
          <TxnListDisplay />
        </TxnProvider>
      </div>
      <p>
        {helloWorld()}
        {
          " This app was made by somehow who literally doesn't do finance tracking so pardon if it seems weird."
        }
      </p>
    </div>
  )
}

export default App
