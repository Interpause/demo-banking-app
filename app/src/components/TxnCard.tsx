import { useState } from 'react'
import { FaArrowRotateRight, FaExpand } from 'react-icons/fa6'
import { TxnData } from './TxnContext'

interface TxnDetailsProps {
  txn: TxnData
}

function TxnDetailsMini({ txn }: TxnDetailsProps) {
  return <p>{`${txn.amount.toFixed(2)} (${txn.type})`}</p>
}

function TxnDetailsMore({ txn }: TxnDetailsProps) {
  return (
    <>
      <p>{`${txn.amount.toFixed(2)} (${txn.type})`}</p>
      <p>{`${txn.created}`}</p>
    </>
  )
}

export interface TxnCardProps {
  id: string
  txn: TxnData | null
  refresh: (id: string) => void
}

/** Transaction card. */
export function TxnCard({ id, txn, refresh }: TxnCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const refreshId = txn ? () => refresh(id) : undefined
  return (
    <div className="relative w-full">
      <div
        className={`absolute mx-auto inset-x-0
          card card-compact card-bordered
          w-[36rem] bg-base-100 shadow-md
          transition-all overflow-clip
          ${isExpanded ? 'h-40 z-10' : 'h-28'}`}
      >
        <div className="card-body gap-0">
          <div className="card-actions justify-start">
            <span>{id}</span>
            <div className="flex-grow"></div>
            <div className="join">
              <button
                className="btn btn-square btn-sm join-item"
                onClick={refreshId}
              >
                <FaArrowRotateRight />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`btn btn-square btn-sm join-item
                  ${isExpanded ? ' btn-primary' : ''}`}
              >
                <FaExpand />
              </button>
            </div>
          </div>
          <div>
            {
              txn ?
                isExpanded ?
                  <TxnDetailsMore txn={txn} />
                : <TxnDetailsMini txn={txn} />
                // Display indicator that txn data is being loaded.
              : <progress className="progress w-56"></progress>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
