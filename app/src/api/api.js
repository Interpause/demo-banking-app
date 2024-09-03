/** Fill in API functions below. */
/* eslint-disable @typescript-eslint/no-unused-vars */

export const USE_MOCK_API = true

/** Create new transaction record. */
async function txnCreate(txn) {
  throw new Error('Not implemented')
}

/** Fetch list of transaction ids. */
async function txnGetIdList() {
  throw new Error('Not implemented')
}

/** Fetch associated transaction data for each id in list. */
async function txnGetIds(ids) {
  throw new Error('Not implemented')
}

/** Update transaction data associated with id. */
async function txnUpdateById(id, txn) {
  throw new Error('Not implemented')
}

/** Delete transaction data associated with id. */
async function txnDeleteById(id) {
  throw new Error('Not implemented')
}

/** @type {import('./types').ApiInterface} */
export default {
  txnCreate,
  txnGetIdList,
  txnGetIds,
  txnUpdateById,
  txnDeleteById,
}
