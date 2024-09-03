/** Generate mock data with loading delay. */

import { DateTime } from 'luxon'
import { v4 } from 'uuid'
import { TxnData } from '../api'
import { sleep } from '../utils'
import { ApiInterface } from './types'

const MOCK_DELAY = 1000
const MOCK_IDS_PER_REFRESH = 50
const MOCK_ID_LIMIT = 1000

const allIds: string[] = []
const idCallCounter: Record<string, number> = {}

const randomTxn = (id: string): TxnData => ({
  id: id,
  counterpartyId: v4(),
  createdAt: DateTime.now(),
  amount: Math.random() * 1000,
  direction: Math.random() > 0.5 ? 'paid' : 'received',
  repeatCron: Math.random() > 0.5 ? '0 0,12 1 */2 *' : null,
  tags: Math.random() > 0.5 ? ['tag1', 'tag2'] : [],
  userNote: Math.random() > 0.5 ? 'This is a note' : '',
})

/** Fetch all ids from server. */
async function fetchAllIds() {
  console.log('fetchAllIds')
  await sleep(MOCK_DELAY)
  // Create new ids each time fetch is called.
  const curlen = allIds.length
  if (curlen >= MOCK_ID_LIMIT) return allIds
  allIds.push(...Array.from({ length: MOCK_IDS_PER_REFRESH }, () => v4()))
  return allIds
}

/** Get data associated with id. */
async function fetchDataById(id: string): Promise<TxnData> {
  const N = idCallCounter[id] ?? 1
  idCallCounter[id] = N + 1
  if (N > 1) console.warn(`fetchDataById (${N})`, id)
  else console.log(`fetchDataById`, id)
  await sleep(MOCK_DELAY)
  return randomTxn(id)
}

/** Get associated data for each id in list. */
async function fetchDataByIds(ids: string[]): Promise<TxnData[]> {
  console.log('fetchDataByIds', ids)
  await sleep(MOCK_DELAY)
  return ids.map(randomTxn)
}

export default {
  fetchAllIds,
  fetchDataById,
  fetchDataByIds,
} satisfies ApiInterface
