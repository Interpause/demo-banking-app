/** Generate mock data with loading delay. */

import { TxnData } from './types'

const MOCK_DELAY = 1000
const MOCK_IDS_PER_REFRESH = 50
const MOCK_ID_LIMIT = 1000

const allIds: string[] = []
const idCallCounter: Record<string, number> = {}

const sleep = (ms: number) => new Promise((next) => setTimeout(next, ms))

/** Fetch all ids from server. */
export async function fetchAllIds() {
  console.log('fetchAllIds')
  await sleep(MOCK_DELAY)
  // Create new ids each time fetch is called.
  const curlen = allIds.length
  if (curlen >= MOCK_ID_LIMIT) return allIds
  allIds.push(
    ...Array.from(
      { length: MOCK_IDS_PER_REFRESH },
      (_, i) => `id-${curlen + i}`,
    ),
  )
  return allIds
}

/** Get data associated with id. */
export async function fetchDataById(id: string): Promise<TxnData> {
  const N = idCallCounter[id] ?? 1
  idCallCounter[id] = N + 1
  if (N > 1) console.warn(`fetchDataById (${N})`, id)
  else console.log(`fetchDataById`, id)
  await sleep(MOCK_DELAY)
  return {
    id,
    amount: Math.random() * 1000,
    type: Math.random() > 0.5 ? 'debit' : 'credit',
    created: new Date().toISOString(),
  }
}

/** Get associated data for each id in list. */
export async function fetchDataByIds(ids: string[]): Promise<TxnData[]> {
  console.log('fetchDataByIds', ids)
  await sleep(MOCK_DELAY)
  return ids.map((id) => ({
    id,
    amount: Math.random() * 1000,
    type: Math.random() > 0.5 ? 'debit' : 'credit',
    created: new Date().toISOString(),
  }))
}
