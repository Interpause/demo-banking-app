import { DateTime } from 'luxon'

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

export type TxnDataOrNull = TxnData | null
export type TxnDataNoId = Omit<TxnData, 'id'>

/** Interface all API providers should implement. */
export interface ApiInterface {
  /** Create new transaction record. */
  txnCreate(txn: TxnDataNoId): Promise<UUID>
  /** Fetch list of transaction ids. */
  txnGetIdList(): Promise<UUID[]>
  /** Fetch associated transaction data for each id in list. */
  txnGetIds(ids: UUID[]): Promise<TxnDataOrNull[]>
  /** Update transaction data associated with id. */
  txnUpdateById(id: UUID, txn: TxnDataNoId): Promise<void>
  /** Delete transaction data associated with id. */
  txnDeleteById(id: UUID): Promise<void>
}

/*
TODO:
- Incorporate bulk update or leave as exercise to reader since its not always needed?
*/
