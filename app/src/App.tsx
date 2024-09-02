import { helloWorld } from './api'
import { TxnProvider } from './components/TxnContext'
import TxnListDisplay from './components/TxnListDisplay'

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
      <div className="w-full h-96">
        <TxnProvider>
          <TxnListDisplay />
        </TxnProvider>
      </div>
      <p>{helloWorld()}</p>
    </div>
  )
}

export default App
