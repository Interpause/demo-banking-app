import cronstrue from 'cronstrue'
import { DateTime } from 'luxon'
import { ComponentProps, useState } from 'react'
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

export const CARD_HEIGHT_REM = 4
export const CARD_EXPANDED_HEIGHT_REM = 10

interface TxnDetailsProps extends TxnData {}

interface TxnDirectionArrowProps extends ComponentProps<'svg'> {
  direction: TxnData['direction']
}

function TxnDirectionArrow({ direction, className }: TxnDirectionArrowProps) {
  switch (direction) {
    case 'paid':
      return <FaCircleArrowRight className={`text-red-500 ${className}`} />
    case 'received':
      return <FaCircleArrowLeft className={`text-green-500 ${className}`} />
    default:
      return <FaCircleQuestion className={`text-gray-500 ${className}`} />
  }
}

function TxnTagsBar({ tags }: { tags: string[] }) {
  return (
    <div className="flex gap-1">
      {tags.map((tag) => (
        <span key={tag} className="badge badge-ghost">
          {tag}
        </span>
      ))}
    </div>
  )
}

function TxnDetailsMini({
  amount,
  direction,
  tags,
  counterpartyId,
}: TxnDetailsProps) {
  return (
    <div className="flex gap-1">
      <span>{`$${amount.toFixed(2)}`}</span>
      <TxnTagsBar tags={tags} />
      <div className="flex-grow" />
      <TxnDirectionArrow direction={direction} className="inline self-center" />
      <span className="font-mono truncate w-[4.5rem]">{counterpartyId}</span>
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
  id: string
  txn: TxnData | null
  refresh: (id: string) => void
  edit: (id: string) => void
  del: (id: string) => void
}

/** Transaction card. */
export function TxnCard({ id, txn, refresh, edit, del }: TxnCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const refreshId = txn ? () => refresh(id) : undefined
  const editId = txn ? () => edit(id) : undefined
  const delId = txn ? () => del(id) : undefined
  const shouldExpand = txn && isExpanded
  const shouldShowMore = txn && shouldExpand
  const shouldShowMini = txn && !shouldExpand

  const expandStyle = {
    height: `${shouldExpand ? CARD_EXPANDED_HEIGHT_REM : CARD_HEIGHT_REM}rem`,
    zIndex: shouldExpand ? 1 : undefined,
  }

  return (
    <div className="flex justify-center">
      <div
        className={`card card-compact card-bordered
          w-[36rem] bg-base-100 shadow-md
          transition-all overflow-clip`}
        style={expandStyle}
      >
        <div className="card-body gap-0">
          <div className="card-actions justify-start">
            <div className="self-center flex-grow">
              {shouldShowMini && <TxnDetailsMini {...txn} />}
              {shouldShowMore && (
                <span className="font-mono text-base-300 hover:text-base-content">
                  {`Transaction: ${id}`}
                </span>
              )}
              {/*Display indicator that txn data is being loaded.*/}
              {txn === null && <progress className="progress w-56"></progress>}
            </div>
            <div className="join">
              <button
                className="btn btn-square btn-sm join-item"
                title="Refresh"
                onClick={refreshId}
              >
                <FaArrowRotateRight />
              </button>
              <button
                className="btn btn-square btn-sm join-item"
                title="Edit"
                onClick={editId}
              >
                <FaPenToSquare />
              </button>
              <button
                className="btn btn-square btn-sm join-item"
                title="Delete"
                onClick={delId}
              >
                <FaRegTrashCan />
              </button>
              <button
                className="btn btn-square btn-sm join-item data-[expanded=true]:btn-primary"
                title="Expand"
                onClick={() => setIsExpanded(!isExpanded)}
                data-expanded={isExpanded}
              >
                <FaExpand />
              </button>
            </div>
          </div>
          {shouldShowMore && <TxnDetailsMore {...txn} />}
        </div>
      </div>
    </div>
  )
}
