/** Infinite scrolling list of transactions. */

import { useCallback, useEffect, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { TxnData } from '../api'
import { rem2px } from '../utils'
import { CARD_HEIGHT_REM, TxnCard } from './TxnCard'
import { useTxn } from './TxnContext'

const REFRESH_TIMEOUT = 2000

/** Indicator that list is loading more ids. */
function LoadingIndicatorItem() {
  return (
    <span className="absolute inset-x-0 mx-auto loading loading-spinner loading-lg"></span>
  )
}

type ItemDataGetter = (index: number) => {
  id: string | undefined
  txn: TxnData | null
  refresh: (id: string) => void
  edit: (id: string) => void
  del: (id: string) => void
}

interface ItemProps extends ListChildComponentProps<ItemDataGetter> {}

/** List item. */
function Item({ data: getItemData, index, style }: ItemProps) {
  const { id, ...props } = getItemData(index)

  return (
    <div style={style}>
      {
        id ?
          <TxnCard id={id} {...props} />
          // Index oob implies more ids being loaded; Display loading indicator.
        : <LoadingIndicatorItem />
      }
    </div>
  )
}

/** Infinite scrolling list of transactions. */
export function TxnListDisplay() {
  const { refreshList, refreshTxn, editTxn, deleteTxn, txnMap, newIds } =
    useTxn()
  const txnIds = Object.keys(txnMap)
  // Timeout refresh if no new ids are found.
  const [allowRefresh, setAllowRefresh] = useState(true)
  // Add extra "loading" item to trigger loading.
  const numItems = txnIds.length + (allowRefresh ? 1 : 0)

  // Item is loaded if its index is within bounds.
  const isItemLoaded = useCallback(
    (index: number) => index < txnIds.length,
    [txnIds.length],
  )

  // Use by Item to get data for item at index.
  const getItemData = useCallback<ItemDataGetter>(
    (index: number) => {
      const id = txnIds[index]
      return {
        id,
        txn: id ? (txnMap[id] ?? null) : null,
        refresh: refreshTxn,
        edit: editTxn,
        del: deleteTxn,
      }
    },
    [deleteTxn, editTxn, refreshTxn, txnIds, txnMap],
  )

  // Timeout refresh if no new ids are found.
  useEffect(() => {
    if (newIds.length > 0) return
    setAllowRefresh(false)
  }, [newIds]) // Abuse change in newIds' identity as indication of no new ids despite refresh.
  useEffect(() => {
    if (allowRefresh) return
    console.log('Timeout refresh')
    const timeout = setTimeout(() => setAllowRefresh(true), REFRESH_TIMEOUT)
    return () => clearTimeout(timeout)
  }, [allowRefresh])

  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={numItems}
          loadMoreItems={refreshList}
          threshold={1}
        >
          {({ onItemsRendered, ref }) => (
            <FixedSizeList
              itemCount={numItems}
              height={height}
              itemSize={rem2px(CARD_HEIGHT_REM + 1)}
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
