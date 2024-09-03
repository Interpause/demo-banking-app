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
import { TxnData, TxnDataOrNull } from '../api'
import { TEMP_getPartyPic, TEMP_HARDCODED_ACCOUNTS } from '../api/mock'
import { useTxnStore } from './TxnStoreContext'

export const CARD_HEIGHT_REM = 6

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
    <div className="flex flex-nowrap py-1 snap-x snap-mandatory overflow-x-auto gap-1 font-light">
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
  const PartyIcon = TEMP_getPartyPic(counterpartyId)

  return (
    <div className="flex w-full gap-1 items-center">
      <span className="font-black">{`$${amount.toFixed(2)}`}</span>
      <TxnDirectionArrow direction={direction} className="inline flex-none" />
      <span className="flex-none">
        <PartyIcon />
      </span>
      <div className="flex-grow" />
      <TxnTagsBar tags={tags} />
    </div>
  )
}

function TxnDetailsMore({
  txnId,
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
  const amountMsg = `$${amount.toFixed(2)} ${directionMsg} ${TEMP_HARDCODED_ACCOUNTS[counterpartyId]?.name}`

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
      <span className="font-mono truncate text-base-300 hover:text-base-content">
        {`Transaction id: ${txnId}`}
      </span>
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
  txn: TxnDataOrNull
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
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const shouldExpand = txn && isExpanded
  const shouldShowMore = txn && shouldExpand
  const shouldShowMini = txn && !shouldExpand

  useEffect(() => {
    if (expanded !== undefined) setIsExpanded(expanded)
  }, [expanded])

  useEffect(() => {
    const cardElm = cardRef.current
    const innerElm = innerRef.current
    if (!cardElm || !innerElm) return

    cardElm.style.zIndex = '1'
    cardElm.style.height = `${innerElm.scrollHeight}px`

    // NOTE: Should match whatever transition duration is set by tailwind.
    const timeout = setTimeout(() => {
      cardElm.style.zIndex = shouldExpand ? '1' : ''
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
        ref={cardRef}
      >
        <div ref={innerRef}>
          <div className="card-body gap-0">
            <div className="card-actions justify-start flex-nowrap items-center">
              <div className="flex flex-1 min-w-0">
                {txn === null ?
                  // Display indicator that txn data is being loaded.
                  <progress className="progress" />
                : <span className="flex-1 min-w-0 truncate">
                    <span className="font-light">{`(${txn.createdAt.toFormat('yyyy-MM-dd')})`}</span>
                    <span className="font-medium">{`\t${txn.name}`}</span>
                  </span>
                }
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
            {shouldShowMini && <TxnDetailsMini {...txn} txnId={txnId} />}
            {shouldShowMore && <TxnDetailsMore {...txn} txnId={txnId} />}
          </div>
        </div>
      </div>
    </div>
  )
}
