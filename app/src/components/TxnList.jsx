/** Infinite scrolling list of transactions. */

import { useCallback, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { fetchAllIds, fetchDataById } from '../mock'
import TxnCard from './TxnCard'

const REFRESH_TIMEOUT = 2000
const ITEM_SIZE_RATIO = 0.1

/** Indicator that list is loading more ids. */
function LoadingIndicatorItem() {
  return (
    <span className="absolute inset-x-0 mx-auto loading loading-spinner loading-lg"></span>
  )
}

/** List item. */
function Item({ data: getItemData, index, style }) {
  const { id, txn, refresh } = getItemData(index)

  return (
    <div style={style}>
      {
        id ?
          <TxnCard id={id} txn={txn} refresh={refresh} />
          // Index oob implies more ids being loaded; Display loading indicator.
        : <LoadingIndicatorItem />
      }
    </div>
  )
}

/** Infinite scrolling list of transactions. */
export default function TxnList() {
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  // Map of id to txn data, where data is null when not yet loaded.
  const [txnMap, setTxnMap] = useState({})

  // Add extra item to trigger loading if there is more ids to load.
  const numItems = Object.keys(txnMap).length + (hasMore ? 1 : 0)

  const isItemLoaded = useCallback(
    (index) => !!Object.keys(txnMap)[index],
    [txnMap],
  )
  const refreshId = useCallback(async (id) => {
    setTxnMap((prevData) => ({ ...prevData, [id]: null }))
    const txn = await fetchDataById(id)
    setTxnMap((prevData) => ({ ...prevData, [id]: txn }))
  }, [])
  const getItemData = useCallback(
    (index) => {
      const id = Object.keys(txnMap)[index]
      return {
        id,
        txn: txnMap[id],
        refresh: refreshId,
      }
    },
    [refreshId, txnMap],
  )

  const refreshIdList = useCallback(async () => {
    if (isLoadingMore) return // Debounce load attempts.

    let newIds = []
    try {
      setIsLoadingMore(true)

      const allIds = await fetchAllIds()
      newIds = allIds.filter((id) => txnMap[id] === undefined)

      if (newIds.length > 0)
        // Add new ids to map as not yet loaded.
        setTxnMap((prevData) => ({
          ...prevData,
          ...Object.fromEntries(newIds.map((id) => [id, null])),
        }))

      setIsLoadingMore(false)
    } catch (error) {
      // TODO: Implement UI indication.
      console.error('Failed to fetch ids.', error)
    } finally {
      setIsLoadingMore(false)
    }

    if (newIds.length === 0) {
      // Reset hasMore to true after timeout to allow retry refresh.
      setHasMore(false)
      setTimeout(() => setHasMore(true), REFRESH_TIMEOUT)
      return
    }

    // Proper way to fetch.
    // const newArr = await fetchDataByIds(newIds)
    // setData((prevData) => ({
    //   ...prevData,
    //   ...Object.fromEntries(newArr.map((txn) => [txn.id, txn])),
    // }))

    // Alternative way to fetch that lets me test per item loading.
    for (const id of newIds) {
      try {
        const txn = await fetchDataById(id)
        setTxnMap((prevData) => ({ ...prevData, [id]: txn }))
      } catch (error) {
        console.error('Failed to fetch txn.', error)
        continue
      }
    }
  }, [isLoadingMore, txnMap])

  if (numItems === 0) refreshIdList()

  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={numItems}
          loadMoreItems={refreshIdList}
        >
          {({ onItemsRendered, ref }) => (
            <FixedSizeList
              itemCount={numItems}
              height={height}
              itemSize={Math.ceil(height * ITEM_SIZE_RATIO)}
              width={width}
              onItemsRendered={onItemsRendered}
              itemData={getItemData}
              ref={ref}
            >
              {Item}
            </FixedSizeList>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  )
}
