import createDebug from 'debug'
import mg, { SchemaTypes as T } from 'mongoose'
import { MONGO_URI } from '../../env.js'

const _debug = createDebug('app:transactions:api')

export async function connectTxnDb() {
  await mg.connect(MONGO_URI)
}

const TxnDataSchema = new mg.Schema({
  _id: T.UUID,
  counterpartyId: {
    type: T.UUID,
    required: true,
  },
  createdAt: {
    type: T.Date,
    required: true,
    immutable: true,
  },
  updatedAt: {
    type: T.Date,
  },
  name: {
    type: T.String,
    required: true,
  },
  amount: {
    type: T.Number,
    required: true,
    min: 0,
  },
  direction: {
    type: T.String,
    required: true,
    enum: ['paid', 'received'],
  },
  repeatCron: T.String, // TODO: validate
  tags: [T.String], // TODO: Use id to tags collection
  userNote: T.String,
})

export const TxnData = mg.model('transaction', TxnDataSchema)

/*

const testTxnData = new TxnData({
  _id: randomUUID(),
  counterpartyId: randomUUID(),
  createdAt: new Date(),
  name: 'Test Transaction',
  amount: 100,
  direction: 'paid',
  tags: ['test', 'example'],
  userNote: 'This is a test transaction.',
})

debug('testTxnData:', testTxnData.toJSON())
const err = testTxnData.validateSync()
if (err) console.error('testTxnData validation error:', err)

*/
