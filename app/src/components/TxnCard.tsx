import { TxnData } from './TxnContext'

export interface TxnCardProps {
  id: string
  txn: TxnData | null
  refresh: (id: string) => void
}

/** Transaction card. */
export function TxnCard({ id, txn, refresh }: TxnCardProps) {
  return (
    <div className="flex flex-row justify-between">
      <span>
        {`${id}: `}
        {
          txn ?
            `${txn.amount.toFixed(2)} (${txn.type})`
            // Display indicator that txn data is being loaded.
          : <progress className="progress w-56"></progress>
        }
      </span>
      {txn ?
        <button onClick={() => refresh(id)} className="btn btn-xs">
          Refresh
        </button>
      : ''}
    </div>
  )
}
