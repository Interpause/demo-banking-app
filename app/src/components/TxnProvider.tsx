/** Context provider for state of transaction list. */

import { useCallback, useEffect, useState } from 'react'
import { fetchAllIds, fetchDataById } from '../api'
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
    const txn = await fetchDataById(id)
    setTxnMap((prev) => ({ ...prev, [id]: txn }))
  }, [])

  // Refresh transaction list.
  useEffect(() => {
    if (!hasRefreshRequest) return () => {}
    let cancelled = false
    ;(async () => {
      // TODO: handle error here.
      try {
        const allIds = await fetchAllIds()
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
      // try {
      //   const txnArr = await fetchDataByIds(newIds)
      //   setTxnMap((prev) => ({
      //     ...prev,
      //     ...Object.fromEntries(txnArr.map((txn) => [txn.id, txn])),
      //   }))
      // } catch (err) {
      //   // TODO: Throw here too.
      //   console.error('Failed to fetch txns.', err)
      // }

      // Alt way to fetch that makes items appear one by one.
      for (const id of newIds) {
        try {
          const txn = await fetchDataById(id)
          setTxnMap((prev) => ({ ...prev, [id]: txn }))
        } catch (err) {
          // TODO: Throw here too.
          console.error('Failed to fetch txn.', err)
        }
      }
    })()
  }, [newIds])

  return (
    <TxnContext.Provider value={{ refreshList, refreshTxn, txnMap, newIds }}>
      {children}
    </TxnContext.Provider>
  )
}
