import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa6'
import { txnCreate, TxnData, TxnDataNoId, txnUpdateById } from './api'
import {
  Toaster,
  TxnListDisplay,
  TxnStoreProvider,
  useTxnStore,
} from './components'
import { TxnEditor } from './components/TxnEditor'

function MainPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [initialTxn, setInitialTxn] = useState<TxnData>()
  const { editorLauncherRef } = useTxnStore()

  const toggleDarkMode = () => {
    localStorage.theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = localStorage.theme
  }
  const editorSubmit = (txn?: TxnData | TxnDataNoId) => {
    // console.log('Submit', txn)
    setIsEditorOpen(false)
    if (!txn) return
    // NOTE: typescript limitation
    const castedTxn = txn as TxnData
    if (castedTxn.id)
      toast
        .promise(txnUpdateById(castedTxn.id, txn), {
          loading: 'Updating...',
          success: `Updated "${txn.name}"!`,
          error: `Failed to update "${txn.name}".`,
        })
        .catch((e) => {
          console.error('Failed to update txn.', e)
        })
    else
      toast
        .promise(txnCreate(txn), {
          loading: 'Submitting...',
          success: `Created "${txn.name}"!`,
          error: `Failed to create "${txn.name}".`,
        })
        .catch((e) => {
          console.error('Failed to create txn.', e)
        })
  }

  const launchEditor = useCallback((txn?: TxnData) => {
    setInitialTxn(txn)
    if (txn) setIsEditorOpen(true)
  }, [])

  useEffect(() => {
    editorLauncherRef.current = launchEditor
  }, [editorLauncherRef, launchEditor])

  useEffect(() => {
    if (isEditorOpen) return
    setInitialTxn(undefined)
  }, [isEditorOpen])

  return (
    <div className="absolute inset-0 flex flex-col items-center">
      <nav className="navbar bg-primary text-primary-content shadow-xl">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          <h1
            className="text-center text-md font-bold"
            onClick={toggleDarkMode}
          >
            {`Demo `}
            <span className="line-through">Banking</span>
            <br />
            {`Finance Tracker App`}
          </h1>
        </div>
        <div className="navbar-end">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setIsEditorOpen(true)}
          >
            <FaPlus />
          </button>
        </div>
      </nav>

      <div className="w-full h-full px-4">
        <TxnListDisplay />
      </div>

      <footer className="prose bg-base-200">
        <p>
          {`I don't do finance tracking or know what I'm doing, so pardon if it seems weird.`}
        </p>
      </footer>

      <TxnEditor
        open={isEditorOpen}
        initialData={initialTxn}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={editorSubmit}
      />
    </div>
  )
}

function App() {
  return (
    <TxnStoreProvider>
      <MainPage />
      <Toaster />
    </TxnStoreProvider>
  )
}

export default App
