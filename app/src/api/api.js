/** Fill in API functions below.
 *
 * These functions should throw errors when they occur as its handled by the caller.
 * Btw, you can debug network responses in the network tab of the browser devtools.
 */

import { DateTime } from 'luxon'

export const USE_MOCK_API = false
const SERVER_URL = 'http://localhost:3000'
const INVALID_ERR = new Error('Invalid response from server')
const RESP_ERR = new Error('Request failed')

/** Create new transaction record. */
async function txnCreate(txn) {
  const res = await fetch(`${SERVER_URL}/transactions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txn),
  })
  if (!res.ok) throw RESP_ERR

  const json = await res.json()
  if (typeof json !== 'object') throw INVALID_ERR
  const id = json.id
  if (typeof id !== 'string') throw INVALID_ERR

  return id
}

/** Fetch list of transaction ids. */
async function txnGetIdList() {
  const res = await fetch(`${SERVER_URL}/transactions/list`)
  if (!res.ok) throw RESP_ERR

  const json = await res.json()
  if (!Array.isArray(json)) throw INVALID_ERR
  else if (!json.every((id) => typeof id === 'string')) throw INVALID_ERR

  return json
}

/** Fetch associated transaction data for each id in list. */
async function txnGetIds(ids) {
  const promises = ids.map(async (id) => {
    const res = await fetch(`${SERVER_URL}/transactions/id/${id}`)
    if (!res.ok) throw RESP_ERR

    const json = await res.json()
    // TODO: Validate this is TxnData.
    if (typeof json !== 'object') throw INVALID_ERR
    json.createdAt = new DateTime(json.createdAt)
    return json
  })

  return await Promise.all(promises)
}

/** Update transaction data associated with id. */
async function txnUpdateById(id, txn) {
  const res = await fetch(`${SERVER_URL}/transactions/id/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txn),
  })
  if (!res.ok) throw RESP_ERR
}

/** Delete transaction data associated with id. */
async function txnDeleteById(id) {
  const res = await fetch(`${SERVER_URL}/transactions/id/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw RESP_ERR
}

/** @type {import('./types').ApiInterface} */
export default {
  txnCreate,
  txnGetIdList,
  txnGetIds,
  txnUpdateById,
  txnDeleteById,
}
