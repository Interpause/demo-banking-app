import { randomUUID } from 'crypto'
import createDebug from 'debug'
import { Router } from 'express'
import { TxnData } from './db.js'

const debug = createDebug('app:transactions:api')

const router = Router()

router.post('/create', async (req, res, _next) => {
  try {
    const body = req.body
    const data = {
      ...body,
      _id: randomUUID(),
      createdAt: new Date(body.createdAt),
    }
    const txn = new TxnData(data)
    debug('Transaction created:', txn)

    await txn.save()
    return res.json({ id: txn._id })
  } catch (e) {
    debug('Failed to create transaction:', e)
    return res.sendStatus(500) // next(e)
  }
})

router.get('/list', async (_req, res, _next) => {
  try {
    const txns = await TxnData.find({}, '_id').exec()
    return res.json(txns.map((t) => t._id))
  } catch (e) {
    debug('Failed to list transactions:', e)
    return res.sendStatus(500) // next(e)
  }
})

router.get('/id/:id', async (req, res, _next) => {
  try {
    const txn = await TxnData.findById(req.params.id).exec()
    if (!txn) return res.sendStatus(404)
    return res.json({
      id: txn._id.toString(),
      counterpartyId: txn.counterpartyId.toString(),
      createdAt: txn.createdAt.toISOString(),
      name: txn.name,
      amount: txn.amount,
      direction: txn.direction,
      repeatCron: txn.repeatCron,
      tags: txn.tags,
      userNote: txn.userNote,
    })
  } catch (e) {
    debug('Failed to get transaction:', e)
    return res.sendStatus(500) // next(e)
  }
})

router.post('/id/:id', async (req, res, _next) => {
  try {
    const body = req.body
    const data = {
      ...body,
      _id: req.params.id,
      updatedAt: new Date(),
    }
    const txn = new TxnData(data)
    debug('Transaction updated:', txn)

    await TxnData.findByIdAndUpdate(txn._id, txn).exec()
    return res.sendStatus(200)
  } catch (e) {
    debug('Failed to update transaction:', e)
    return res.sendStatus(500) // next(e)
  }
})

router.delete('/id/:id', async (req, res, _next) => {
  try {
    await TxnData.findByIdAndDelete(req.params.id).exec()
    return res.sendStatus(200)
  } catch (e) {
    debug('Failed to delete transaction:', e)
    return res.sendStatus(500) // next(e)
  }
})

export default router
