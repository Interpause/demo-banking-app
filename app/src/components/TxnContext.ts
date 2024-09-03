/** Context for state of transaction list. */

import { createContext, useContext } from 'react'
import { TxnData } from '../api'

/** List of txns as map of id to txn data, where data is null till loaded. */
export type TxnMap = Record<string, TxnData | null>

/** Type for TxnContext. */
export type TxnContextType = {
  /** Function passed to consumers to refresh txn list. */
  refreshList: () => void
  /** Function passed to consumers to refresh specific txn by id. */
  refreshTxn: (id: string) => void
  /** List of txns as map of id to txn data, where data is null till loaded. */
  txnMap: TxnMap
  /** List of newly added txn ids. */
  newIds: string[]
}

export const TxnContext = createContext<TxnContextType | null>(null)

/** Hook to access transaction list and related functions. */
export function useTxn() {
  const context = useContext(TxnContext)
  if (!context) throw new Error('useTxn must be used within a TxnProvider.')
  return context
}
