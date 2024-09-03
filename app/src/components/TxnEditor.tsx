import cronstrue from 'cronstrue'
import { DateTime } from 'luxon'
import { FormEvent, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { TxnData, TxnDataNoId } from '../api'
import { TEMP_getPartyPic, TEMP_HARDCODED_ACCOUNTS } from '../api/mock'
import Toaster from './Toaster'
import { TxnDirectionArrow } from './TxnCard'

// TODO: Use dropdown instead of select to allow showing icons in the select.
// TODO: Smart tag input with bubbles and autocomplete.

/** Will throw if anything is invalid. */
function convertFormData(fd: FormData): TxnDataNoId {
  // counterpartyId
  const counterpartyId = (fd.get('counterpartyId') as string | null) ?? ''
  if (!TEMP_HARDCODED_ACCOUNTS[counterpartyId])
    throw new Error('Party selected does not exist!')

  // createdAt
  const createdAt = DateTime.now()

  // name
  const name = ((fd.get('name') as string | null) ?? '').trim()
  if (name === '') throw new Error('Name is required.')

  // amount
  const amount = parseFloat((fd.get('amount') as string | null) ?? '')
  if (isNaN(amount)) throw new Error('Amount is not a valid number.')
  if (amount < 0) throw new Error('Amount cannot be negative.')

  // direction
  const direction =
    (fd.get('direction') as string | null) === 'on' ? 'paid' : 'received'

  // repeatCron
  let repeatCron = fd.get('repeatCron') as string | null
  try {
    if (typeof repeatCron === 'string') {
      repeatCron = repeatCron.trim()
      if (repeatCron === '') repeatCron = null
      else cronstrue.toString(repeatCron) // Will throw if invalid.
    }
  } catch (_) {
    throw new Error('Invalid cron expression!')
  }

  // tags
  const tags =
    (fd.get('tags') as string | null)
      ?.split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0) ?? []

  // userNote
  const userNote = (fd.get('userNote') as string | null) ?? ''

  return {
    counterpartyId,
    createdAt,
    name,
    amount,
    direction,
    repeatCron,
    tags,
    userNote,
  }
}

export interface TxnEditorProps {
  open: boolean
  initialData?: TxnData
  onClose: () => void
  onSubmit: (txn: TxnData | TxnDataNoId) => void
}

/** Transaction editor. */
export function TxnEditor({
  open,
  initialData,
  onClose,
  onSubmit,
}: TxnEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const selectedPartyRef = useRef<HTMLSelectElement>(null)
  const dirToggleRef = useRef<HTMLInputElement>(null)
  const [direction, setDirection] = useState<'paid' | 'received'>('paid')
  const [selectedPartyId, setSelectedPartyId] = useState('null')

  const SelectedIcon = TEMP_getPartyPic(selectedPartyId)

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const txn = convertFormData(formData)
      // console.log('Txn', txn)
      if (initialData) onSubmit({ ...txn, id: initialData.id })
      else onSubmit(txn)
    } catch (e) {
      toast.error((e as Error).message)
      console.error(e)
    }

    return false
  }

  const reactToChanges = () => {
    const toggleElm = dirToggleRef.current
    if (!toggleElm) return
    setDirection(toggleElm.checked ? 'paid' : 'received')

    const selectElm = selectedPartyRef.current
    if (!selectElm) return
    setSelectedPartyId(selectElm.value)
  }

  useEffect(() => {
    const dialogElm = dialogRef.current
    if (!dialogElm) return

    // NOTE: For this reset to work, none of the inputs should be controlled.
    // Hence all the hacky refs for reading input state...
    formRef.current?.reset()
    if (open) dialogElm.showModal()
    else dialogElm.close()
  }, [open])

  useEffect(() => {
    const dialogElm = dialogRef.current
    if (!dialogElm) return

    reactToChanges()
    dialogElm.addEventListener('close', onClose)
    return () => dialogElm.removeEventListener('close', onClose)
  })

  // Specifically <select> is glitchy since the options are not loaded yet.
  useEffect(() => {
    if (!initialData) return
    if (!selectedPartyRef.current) return
    selectedPartyRef.current.value = initialData.counterpartyId ?? 'null'
    reactToChanges()
  }, [initialData])

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle z-10">
      <form ref={formRef} className="modal-box" onSubmit={handleFormSubmit}>
        <h3 className="font-bold text-lg">{`${initialData ? 'Edit' : 'New'} Transaction`}</h3>
        <div className="form-control gap-2 mt-2">
          <div className="flex items-center gap-2 text-lg">
            <input
              type="text"
              className="input input-bordered input-sm flex-auto min-w-0"
              title="Name"
              name="name"
              defaultValue={initialData?.name ?? ''}
              placeholder="Short Descriptive Name..."
              required
            />
            <input
              type="text"
              className="input input-bordered input-sm flex-auto min-w-0"
              title="Cron Expression"
              name="repeatCron"
              defaultValue={initialData?.repeatCron ?? ''}
              placeholder="Cron Expression..."
              size={4}
            />
          </div>

          <div className="flex items-center gap-1.5 text-lg">
            <input
              type="number"
              className="input input-bordered input-sm"
              min={0}
              step={0.01}
              size={8}
              title="Amount"
              name="amount"
              defaultValue={initialData?.amount ?? ''}
              placeholder="Amount"
              required
            />
            <input
              ref={dirToggleRef}
              type="checkbox"
              className="toggle toggle-md"
              title="Payment Direction"
              name="direction"
              defaultChecked={
                initialData ? initialData.direction === 'paid' : true
              }
              onClick={reactToChanges}
            />
            <TxnDirectionArrow className="inline" direction={direction} />
            <SelectedIcon className="inline relative left-4 -m-3 pointer-events-none" />
            <select
              ref={selectedPartyRef}
              className="select select-bordered select-sm pl-6 flex-1 min-w-0"
              title="Selected Party"
              name="counterpartyId"
              defaultValue={initialData?.counterpartyId ?? 'null'}
              onChange={reactToChanges}
            >
              <option disabled value="null">
                Select Party...
              </option>
              {Object.entries(TEMP_HARDCODED_ACCOUNTS).map(
                ([_, { id, name }]) => {
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  )
                },
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 text-lg">
            <input
              type="text"
              className="input input-bordered input-sm flex-auto min-w-0"
              title="Tags"
              name="tags"
              defaultValue={initialData?.tags.join(', ') ?? ''}
              placeholder="tag1, tag2, tag3, ..."
            />
          </div>

          <textarea
            className="textarea textarea-bordered textarea-xs"
            title="User Note"
            name="userNote"
            defaultValue={initialData?.userNote ?? ''}
            placeholder="Any notes?"
          />
        </div>
        <div className="modal-action">
          <button type="submit" className="btn btn-sm btn-primary">
            {initialData ? 'Update' : 'Submit'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </div>
      </form>
      {/* Has to be placed here due to https://github.com/timolins/react-hot-toast/issues/342.*/}
      <Toaster />
    </dialog>
  )
}
