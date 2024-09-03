import cronstrue from 'cronstrue'
import { DateTime } from 'luxon'
import { ComponentProps, useEffect, useRef, useState } from 'react'
import {
  FaArrowRotateRight,
  FaCircleArrowLeft,
  FaCircleArrowRight,
  FaCircleQuestion,
  FaExpand,
  FaPenToSquare,
  FaRegTrashCan,
} from 'react-icons/fa6'
import { TxnData } from '../api'
import { rem2px } from '../utils'
import { useTxnStore } from './TxnStoreContext'

export const CARD_HEIGHT_REM = 4

export interface TxnDirectionArrowProps extends ComponentProps<'svg'> {
  direction: TxnData['direction']
}

export function TxnDirectionArrow({
  direction,
  className,
}: TxnDirectionArrowProps) {
  switch (direction) {
    case 'paid':
      return (
        <FaCircleArrowRight
          title={direction}
          className={`text-red-500 ${className}`}
        />
      )
    case 'received':
      return (
        <FaCircleArrowLeft
          title={direction}
          className={`text-green-500 ${className}`}
        />
      )
    default:
      return (
        <FaCircleQuestion
          title={direction}
          className={`text-gray-500 ${className}`}
        />
      )
  }
}

function TxnTagsBar({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-nowrap py-1 snap-x snap-mandatory overflow-x-auto gap-1">
      {tags.map((tag) => (
        <span key={tag} className="badge badge-ghost snap-start">
          {tag}
        </span>
      ))}
    </div>
  )
}

interface TxnDetailsProps extends Omit<TxnData, 'id'> {
  txnId: string
}

function TxnDetailsMini({
  amount,
  direction,
  tags,
  counterpartyId,
}: TxnDetailsProps) {
  return (
    <div className="flex w-full gap-1 items-center">
      <span>{`$${amount.toFixed(2)}`}</span>
      <TxnTagsBar tags={tags} />
      <div className="flex-grow" />
      <TxnDirectionArrow direction={direction} className="inline flex-none" />
      <span className="flex-none truncate w-[4.5rem] font-mono">
        {counterpartyId}
      </span>
    </div>
  )
}

function TxnDetailsMore({
  amount,
  createdAt,
  counterpartyId,
  direction,
  tags,
  repeatCron,
}: TxnDetailsProps) {
  let directionMsg
  switch (direction) {
    case 'paid':
      directionMsg = 'paid to'
      break
    case 'received':
      directionMsg = 'received from'
      break
    default:
      directionMsg = 'involved with'
  }
  const amountMsg = `$${amount.toFixed(2)} ${directionMsg} ${counterpartyId}`

  const cronMsg =
    repeatCron &&
    `repeated ${
      // uncapitalize the first character of cronstrue output
      cronstrue.toString(repeatCron).charAt(0).toLowerCase() +
      cronstrue.toString(repeatCron).slice(1)
    }`

  return (
    <div className="flex flex-col flex-grow">
      <span>{amountMsg}</span>
      <span>{`on ${createdAt.toLocaleString(DateTime.DATETIME_MED)}`}</span>
      {cronMsg && <span>{cronMsg}</span>}
      <div className="flex-grow" />
      <TxnTagsBar tags={tags} />
    </div>
  )
}

export interface TxnCardProps {
  txnId: string
  expanded?: boolean
}

/** Transaction card that is standalone given context. */
export function TxnCard({ txnId, expanded = true }: TxnCardProps) {
  const { refreshTxn, editTxn, deleteTxn, txnMap } = useTxnStore()
  return (
    <TxnCardItem
      txnId={txnId}
      txn={txnMap[txnId] ?? null}
      expanded={expanded}
      refresh={refreshTxn}
      edit={editTxn}
      del={deleteTxn}
    />
  )
}

export interface TxnCardItemProps extends TxnCardProps {
  txn: TxnData | null
  refresh: (id: string) => void
  edit: (id: string) => void
  del: (id: string) => void
}

/** Transaction card meant to be used inside TxnList meant to be used inside TxnList. */
export function TxnCardItem({
  txnId,
  txn,
  expanded,
  refresh,
  edit,
  del,
}: TxnCardItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)

  const shouldExpand = txn && isExpanded
  const shouldShowMore = txn && shouldExpand
  const shouldShowMini = txn && !shouldExpand

  useEffect(() => {
    if (expanded !== undefined) setIsExpanded(expanded)
  }, [expanded])

  useEffect(() => {
    const divElm = divRef.current
    if (!divElm) return

    divElm.style.zIndex = '1'
    divElm.style.height = `${shouldExpand ? divElm.scrollHeight : rem2px(CARD_HEIGHT_REM)}px`

    // NOTE: Should match whatever transition duration is set by tailwind.
    const timeout = setTimeout(() => {
      divElm.style.zIndex = shouldExpand ? '1' : ''
    }, 200)
    return () => clearTimeout(timeout)
  }, [shouldExpand])

  return (
    <div
      className={`flex justify-center group ${isExpanded ? 'expanded' : ''}`}
    >
      <div
        className={`card card-compact card-bordered
          max-w-full w-[36rem] bg-base-100 shadow-md
          transition-[height] duration-200 overflow-clip`}
        ref={divRef}
      >
        <div className="card-body gap-0">
          <div className="card-actions justify-start flex-nowrap items-center">
            <div className="flex-1 min-w-0">
              {shouldShowMini && <TxnDetailsMini {...txn} txnId={txnId} />}
              {shouldShowMore && (
                <span className="font-mono truncate text-base-300 hover:text-base-content">
                  {txnId}
                </span>
              )}
              {/*Display indicator that txn data is being loaded.*/}
              {txn === null && <progress className="progress"></progress>}
            </div>
            <div className="join hidden sm:block group-[.expanded]:block">
              <button
                className="btn btn-square btn-sm join-item"
                title="Refresh"
                disabled={!txn}
                onClick={() => refresh(txnId)}
              >
                <FaArrowRotateRight />
              </button>
              <button
                className="btn btn-square btn-sm join-item"
                title="Edit"
                disabled={!txn}
                onClick={() => edit(txnId)}
              >
                <FaPenToSquare />
              </button>
              <button
                className="btn btn-square btn-sm join-item"
                title="Delete"
                disabled={!txn}
                onClick={() => del(txnId)}
              >
                <FaRegTrashCan />
              </button>
              <button
                className="btn btn-square btn-sm join-item group-[.expanded]:btn-primary"
                title="Expand"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <FaExpand />
              </button>
            </div>
            <button
              className="sm:hidden btn btn-square btn-sm group-[.expanded]:hidden"
              title="Expand"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FaExpand />
            </button>
          </div>
          {shouldShowMore && <TxnDetailsMore {...txn} txnId={txnId} />}
        </div>
      </div>
    </div>
  )
}
