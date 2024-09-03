/** Context provider for state of transaction list. */

import { useCallback, useEffect, useState } from 'react'
import { txnDeleteById, txnGetIdList, txnGetIds } from '../api'
import { TxnContext, TxnMap } from './TxnContext'

export interface TxnProviderProps {
  children: React.ReactNode
}

/** Context provider for transaction list and other related functions. */
export function TxnProvider({ children }: TxnProviderProps) {
  // List of all txns as map of id to txn data, where data is null till loaded.
  const [txnMap, setTxnMap] = useState<TxnMap>({})
  // List of newly added txn ids to fetch txn data for.
  const [newIds, setNewIds] = useState<string[]>([])
  // Request for refresh. Starts as true to fetch initial list.
  const [hasRefreshRequest, setHasRefreshRequest] = useState(true)
  // Txn ids already known of.
  const txnIds = Object.keys(txnMap)

  // Function passed to consumers to refresh txn list.
  const refreshList = useCallback(() => setHasRefreshRequest(true), [])

  // Function passed to consumers to refresh specific txn by id.
  const refreshTxn = useCallback(async (id: string) => {
    setTxnMap((prev) => ({ ...prev, [id]: null }))
    const txn = (await txnGetIds([id]))[0]
    if (!txn)
      // Treat txn as deleted if not found.
      setTxnMap((prev) => {
        const { [id]: _unused, ...rest } = prev
        return rest
      })
    else setTxnMap((prev) => ({ ...prev, [id]: txn }))
  }, [])

  // TODO Allow consumers to trigger edit mode.
  const editTxn = useCallback(async (id: string) => {
    throw new Error(id)
  }, [])

  // TODO Allow consumers to delete txn.
  const deleteTxn = useCallback(async (id: string) => {
    setTxnMap((prev) => {
      const { [id]: _unused, ...rest } = prev
      return rest
    })
    await txnDeleteById(id)
  }, [])

  // Refresh transaction list.
  useEffect(() => {
    if (!hasRefreshRequest) return () => {}
    let cancelled = false
    ;(async () => {
      // TODO: handle error here.
      try {
        const allIds = await txnGetIdList()
        if (cancelled) return
        const nids = allIds.filter((id) => !txnIds.includes(id))
        // Add new ids to txn list as null to indicate not yet loaded.
        if (nids.length > 0)
          setTxnMap((prev) => ({
            ...prev,
            ...Object.fromEntries(nids.map((id) => [id, null])),
          }))
        console.log('Set newIds', nids)
        setNewIds(nids)
      } finally {
        if (!cancelled) setHasRefreshRequest(false)
      }
    })()
    return () => (cancelled = true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRefreshRequest, JSON.stringify(txnIds)])

  // Fetch txn data for new ids.
  useEffect(() => {
    if (newIds.length === 0) return
    ;(async () => {
      // Proper way to fetch.
      try {
        const txnArr = await txnGetIds(newIds)
        const added = Object.fromEntries(
          txnArr.filter((txn) => txn !== null).map((txn) => [txn.id, txn]),
        )
        setTxnMap((prev) => ({ ...prev, ...added }))
      } catch (err) {
        // TODO: Throw here too.
        console.error('Failed to fetch txns.', err)
      }
    })()
  }, [newIds])

  return (
    <TxnContext.Provider
      value={{ refreshList, refreshTxn, deleteTxn, editTxn, txnMap, newIds }}
    >
      {children}
    </TxnContext.Provider>
  )
}
