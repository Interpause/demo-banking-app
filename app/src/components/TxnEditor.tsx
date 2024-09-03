import cronstrue from 'cronstrue'
import { DateTime } from 'luxon'
import { FormEvent, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaBasketShopping, FaCircleQuestion, FaYoutube } from 'react-icons/fa6'
import { IconType } from 'react-icons/lib'
import { RiDrinks2Fill } from 'react-icons/ri'
import { TxnDataNoId } from '../api/types'
import Toaster from './Toaster'
import { TxnDirectionArrow } from './TxnCard'

type PartyData = {
  id: string
  name: string
  imgUrl: string
}

const TEMP_HARDCODED_ACCOUNTS: PartyData[] = [
  {
    id: '863cbec0-6899-48f9-ad27-09c18fa91c18',
    name: 'Shoppee',
    imgUrl: 'placeholder_shoppee',
  },
  {
    id: 'eefd8c3a-d198-4606-bbe3-75797971d42f',
    name: 'T-Labs',
    imgUrl: 'placeholder_tlabs',
  },
  {
    id: '419fcb91-de6a-4c8d-8096-eb077f89ac95',
    name: 'YouTube Premium',
    imgUrl: 'placeholder_youtube',
  },
]

const TEMP_IMG_MAP: Record<string, IconType> = {
  placeholder_shoppee: FaBasketShopping,
  placeholder_tlabs: RiDrinks2Fill,
  placeholder_youtube: FaYoutube,
}

// TODO: Use dropdown instead of select to allow showing icons in the select.
// TODO: Smart tag input with bubbles and autocomplete.

/** Will throw if anything is invalid. */
function convertFormData(fd: FormData): TxnDataNoId {
  // counterpartyId
  const counterpartyId = (fd.get('counterpartyId') as string | null) ?? ''
  if (!TEMP_HARDCODED_ACCOUNTS.some((party) => party.id === counterpartyId))
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
  } catch (_unused) {
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
  onClose: () => void
  onSubmit: (txn: TxnDataNoId) => void
}

/** Transaction editor. */
export function TxnEditor({ open, onClose, onSubmit }: TxnEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const selectedPartyRef = useRef<HTMLSelectElement>(null)
  const dirToggleRef = useRef<HTMLInputElement>(null)
  const [direction, setDirection] = useState<'paid' | 'received'>('paid')
  const [selectedPartyId, setSelectedPartyId] = useState('null')

  const SelectedIcon =
    TEMP_IMG_MAP[
      TEMP_HARDCODED_ACCOUNTS.find((party) => party.id === selectedPartyId)
        ?.imgUrl ?? ''
    ] ?? FaCircleQuestion

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const txn = convertFormData(formData)
      // console.log('Txn', txn)
      onSubmit(txn)
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

    if (open) dialogElm.showModal()
    else {
      dialogElm.close()
      // NOTE: For this reset to work, none of the inputs should be controlled.
      // Hence all the hacky refs for reading input state...
      formRef.current?.reset()
    }
  }, [open])

  useEffect(() => {
    const dialogElm = dialogRef.current
    if (!dialogElm) return

    reactToChanges()
    dialogElm.addEventListener('close', onClose)
    return () => dialogElm.removeEventListener('close', onClose)
  })

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle z-10">
      <form ref={formRef} className="modal-box" onSubmit={handleFormSubmit}>
        <h3 className="font-bold text-lg">{` Transaction`}</h3>
        <div className="form-control gap-2 mt-2">
          <div className="flex items-center gap-2 text-lg">
            <input
              type="text"
              className="input input-bordered input-sm flex-auto min-w-0"
              title="Name"
              name="name"
              placeholder="Short Descriptive Name..."
              required
            />
            <input
              type="text"
              className="input input-bordered input-sm flex-auto min-w-0"
              title="Cron Expression"
              name="repeatCron"
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
              placeholder="Amount"
              required
            />
            <input
              ref={dirToggleRef}
              type="checkbox"
              className="toggle toggle-md"
              title="Payment Direction"
              name="direction"
              defaultChecked
              onClick={reactToChanges}
            />
            <TxnDirectionArrow className="inline" direction={direction} />
            <SelectedIcon className="inline relative left-4 -m-3 pointer-events-none" />
            <select
              ref={selectedPartyRef}
              className="select select-bordered select-sm pl-6 flex-1 min-w-0"
              title="Selected Party"
              defaultValue="null"
              name="counterpartyId"
              onChange={reactToChanges}
            >
              <option disabled value="null">
                Select Party...
              </option>
              {TEMP_HARDCODED_ACCOUNTS.map(({ id, name }) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 text-lg">
            <input
              type="text"
              className="input input-bordered input-sm flex-auto min-w-0"
              title="Tags"
              name="tags"
              placeholder="tag1, tag2, tag3, ..."
            />
          </div>

          <textarea
            className="textarea textarea-bordered textarea-xs"
            title="User Note"
            name="userNote"
            placeholder="Any notes?"
          />
        </div>
        <div className="modal-action">
          <button type="submit" className="btn btn-sm btn-primary">
            Submit
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
