/** Context for state of transaction list. */

import { createContext, MutableRefObject, useContext } from 'react'
import { TxnData, TxnDataOrNull } from '../../api'

/** List of txns as map of id to txn data, where data is null till loaded. */
export type TxnMap = Record<string, TxnDataOrNull>

export type EditorLauncher = (txn?: TxnData) => void

/** Type for TxnContext. */
export type TxnStoreType = {
  /** Function passed to consumers to refresh txn list. */
  refreshList: () => void
  /** Function passed to consumers to refresh specific txn by id. */
  refreshTxn: (id: string) => void
  /** Function passed to consumers to delete txn by id. */
  deleteTxn: (id: string) => void
  /** Function passed to consumers to trigger edit mode for txn by id. */
  editTxn: (id: string) => void
  /** Set function to open editor with initial txn data. */
  editorLauncherRef: MutableRefObject<EditorLauncher>
  /** List of txns as map of id to txn data, where data is null till loaded. */
  txnMap: TxnMap
  /** List of newly added txn ids. */
  newIds: string[]
}

export const TxnStoreContext = createContext<TxnStoreType | null>(null)

/** Hook to access transaction list and related functions. */
export function useTxnStore() {
  const context = useContext(TxnStoreContext)
  if (!context) throw new Error('useTxn must be used within a TxnProvider.')
  return context
}
