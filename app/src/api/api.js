/** Fill in API functions below. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/** Fetch all ids from server. */
async function txnGetIdList() {
  throw new Error('Not implemented')
}

/** Get data associated with id. */
async function txnGetId(id) {
  throw new Error('Not implemented')
}

/** Get associated data for each id in list. */
async function txnGetIds(ids) {
  throw new Error('Not implemented')
}

/** @type {import('./types').ApiInterface} */
export default {
  txnGetIdList,
  txnGetId,
  txnGetIds,
}
