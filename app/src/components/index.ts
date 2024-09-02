import { useContext } from 'react'
import { TxnContext } from './TxnContext'

export { TxnProvider } from './TxnContext'

/** Hook to access transaction list and related functions. */
export function useTxn() {
  const context = useContext(TxnContext)
  if (!context) throw new Error('useTxn must be used within a TxnProvider.')
  return context
}
