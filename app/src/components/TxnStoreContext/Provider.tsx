/** Context provider for state of transaction list. */

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { txnDeleteById, txnGetIdList, txnGetIds } from '../../api'
import { TxnMap, TxnStoreContext } from './context'

export interface TxnStoreProviderProps {
  children: React.ReactNode
}

/** Context provider for transaction list and other related functions. */
export function TxnStoreProvider({ children }: TxnStoreProviderProps) {
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
    try {
      const txn = (await txnGetIds([id]))[0]
      if (!txn)
        // Treat txn as deleted if not found.
        setTxnMap((prev) => {
          const { [id]: _unused, ...rest } = prev
          return rest
        })
      else setTxnMap((prev) => ({ ...prev, [id]: txn }))
    } catch (e) {
      toast.error('Failed to fetch transaction!')
      console.error('Failed to fetch txn.', e)
    }
  }, [])

  // TODO Allow consumers to trigger edit mode.
  const editTxn = useCallback(async (id: string) => {
    throw new Error(id)
  }, [])

  const deleteTxn = useCallback(
    async (id: string) => {
      const txn = txnMap[id]
      if (!txn) {
        console.error('Txn not found to delete.', id)
        return
      }
      // Put the transaction into fake "loading" state.
      setTxnMap((prev) => ({ ...prev, [id]: null }))
      try {
        await toast.promise(txnDeleteById(id), {
          loading: 'Deleting...',
          success: `Deleted "${txn.name}"!`,
          error: `Failed to delete "${txn.name}".`,
        })
        // Delete from local state.
        setTxnMap((prev) => {
          const { [id]: _unused, ...rest } = prev
          return rest
        })
      } catch (e) {
        console.error('Failed to delete txn.', e)
      }
    },
    [txnMap],
  )

  // Refresh transaction list.
  useEffect(() => {
    if (!hasRefreshRequest) return () => {}
    let cancelled = false
    ;(async () => {
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
        // console.log('Set newIds', nids)
        setNewIds(nids)
      } catch (e) {
        toast.error('Failed to fetch transaction list!')
        console.error('Failed to fetch txn list.', e)
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
      } catch (e) {
        toast.error('Failed to fetch transactions!')
        console.error('Failed to fetch txns.', e)
      }
    })()
  }, [newIds])

  return (
    <TxnStoreContext.Provider
      value={{ refreshList, refreshTxn, deleteTxn, editTxn, txnMap, newIds }}
    >
      {children}
    </TxnStoreContext.Provider>
  )
}
