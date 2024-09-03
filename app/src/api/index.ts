import api from './mock'
// import api from './api'

export type { TxnData, UUID } from './types'
export const txnCreate = api.txnCreate
export const txnGetIdList = api.txnGetIdList
export const txnGetIds = api.txnGetIds
export const txnUpdateById = api.txnUpdateById
export const txnDeleteById = api.txnDeleteById
