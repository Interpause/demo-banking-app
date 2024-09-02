/** Context for state of transaction list. */

import { DateTime } from 'luxon'
import { createContext, useContext } from 'react'

// TODO: Can transactions be deleted? Need to handle.

export type UUID = string

export interface TxnData {
  id: UUID
  counterpartyId: UUID
  createdAt: DateTime
  amount: number
  direction: 'paid' | 'received'
  repeatCron: null | string // Should be cron-compatible string
  tags: string[]
  userNote: string

  // attachmentIds: UUID[]
  // location: string
  // method: 'cash' | `card-${UUID}` // TODO: others
  // Realized you cant actually handle foreign currency if the user is allowed
  // to change base currency unless you have a db of all exchange rates at the time.
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

export const TxnContext = createContext<TxnContextType | null>(null)

/** Hook to access transaction list and related functions. */
export function useTxn() {
  const context = useContext(TxnContext)
  if (!context) throw new Error('useTxn must be used within a TxnProvider.')
  return context
}
