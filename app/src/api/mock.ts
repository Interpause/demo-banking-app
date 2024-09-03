/** Generate mock data with loading delay. */

import { DateTime } from 'luxon'
import { FaBasketShopping, FaYoutube } from 'react-icons/fa6'
import { IconType } from 'react-icons/lib'
import { RiDrinks2Fill } from 'react-icons/ri'
import { v4 } from 'uuid'
import { TxnData } from '../api'
import { TxnMap } from '../components'
import { sleep } from '../utils'
import { ApiInterface, TxnDataNoId } from './types'

export type PartyData = {
  id: string
  name: string
  imgUrl: string
}

export const TEMP_HARDCODED_ACCOUNTS: PartyData[] = [
  {
    id: '863cbec0-6899-48f9-ad27-09c18fa91c18',
    name: 'Shoppee',
    imgUrl: 'placeholder_shoppee',
  },
  {
    id: 'eefd8c3a-d198-4606-bbe3-75797971d42f',
    name: 'T-Labs',
    imgUrl: 'placeholder_tlabs',
  },
  {
    id: '419fcb91-de6a-4c8d-8096-eb077f89ac95',
    name: 'YouTube Premium',
    imgUrl: 'placeholder_youtube',
  },
]

export const TEMP_IMG_MAP: Record<string, IconType> = {
  placeholder_shoppee: FaBasketShopping,
  placeholder_tlabs: RiDrinks2Fill,
  placeholder_youtube: FaYoutube,
}

const MOCK_DELAY = 1000
const MOCK_IDS_PER_REFRESH = 2
const MOCK_ID_LIMIT = 10

const allIds: TxnMap = {}
const idCallCounter: Record<string, number> = {}

const randomTxn = (id: string): TxnData => ({
  id,
  counterpartyId: v4(),
  createdAt: DateTime.now(),
  name: 'Transaction Name',
  amount: Math.random() * 1000,
  direction: Math.random() > 0.5 ? 'paid' : 'received',
  repeatCron: Math.random() > 0.5 ? '0 0,12 1 */2 *' : null,
  tags:
    Math.random() > 0.5 ? ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] : [],
  userNote: Math.random() > 0.5 ? 'This is a note' : '',
})

/** Create new transaction record. */
async function txnCreate(txn: TxnDataNoId) {
  console.log('createTxn', txn)
  await sleep(MOCK_DELAY)
  let id = v4()
  while (allIds[id]) id = v4()
  allIds[id] = { ...txn, id }
  return id
}

/** Fetch list of transaction ids. */
async function txnGetIdList() {
  console.log('fetchTxnList')
  await sleep(MOCK_DELAY)
  // Create new ids each time fetch is called.
  const curlen = Object.keys(allIds).length
  if (curlen >= MOCK_ID_LIMIT) return Object.keys(allIds)
  Array.from({ length: MOCK_IDS_PER_REFRESH }, () => v4()).forEach(
    (id) => (allIds[id] = randomTxn(id)),
  )
  return Object.keys(allIds)
}

/** Fetch transaction data associated with id. */
async function txnGetId(id: string) {
  const N = idCallCounter[id] ?? 1
  idCallCounter[id] = N + 1
  console.assert(N < 2, `fetchTxn (${N})`, id)
  // await sleep(MOCK_DELAY)
  return allIds[id] ?? null
}

/** Fetch associated transaction data for each id in list. */
async function txnGetIds(ids: string[]) {
  console.log('fetchTxns', ids)
  await sleep(MOCK_DELAY)
  return await Promise.all(ids.map(txnGetId))
}

/** Update transaction data associated with id. */
async function txnUpdateById(id: string, txn: TxnDataNoId) {
  console.log('updateTxn', id, txn)
  await sleep(MOCK_DELAY)
  allIds[id] = { ...txn, id }
}

/** Delete transaction data associated with id. */
async function txnDeleteById(id: string) {
  console.log('deleteTxn', id)
  await sleep(MOCK_DELAY)
  delete allIds[id]
}

export default {
  txnCreate,
  txnGetIdList,
  txnGetIds,
  txnUpdateById,
  txnDeleteById,
} satisfies ApiInterface
