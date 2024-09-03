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

/** Interface all API providers should implement. */
export interface ApiInterface {
  /** Fetch all ids from server. */
  txnGetIdList(): Promise<UUID[]>
  /** Get data associated with id. */
  txnGetId(id: UUID): Promise<TxnData>
  /** Get associated data for each id in list. */
  txnGetIds(ids: UUID[]): Promise<TxnData[]>
}
