/** Transaction card. */
export default function TxnCard({ id, txn, refresh }) {
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
