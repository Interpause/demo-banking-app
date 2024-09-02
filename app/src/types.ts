export interface TxnData {
  id: string
  amount: number
  type: 'debit' | 'credit'
  created: string
}

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
