import api, { USE_MOCK_API } from './api'
import mock from './mock'

export type { TxnData, UUID } from './types'

const a = USE_MOCK_API ? mock : api
export const txnCreate = a.txnCreate
export const txnGetIdList = a.txnGetIdList
export const txnGetIds = a.txnGetIds
export const txnUpdateById = a.txnUpdateById
export const txnDeleteById = a.txnDeleteById
