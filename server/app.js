/** Server entrypoint. */

import './env.js' // Load env vars, must be first.

import cookieParser from 'cookie-parser'
import cors from 'cors'
import createDebug from 'debug'
import express, { json, urlencoded } from 'express'
import logger from 'morgan'
import indexRouter from './routes/index.js'
import txnRouter from './routes/transactions/api.js'
import { connectTxnDb } from './routes/transactions/db.js'
import usersRouter from './routes/users.js'

const debug = createDebug('app:app')

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/transactions', txnRouter)

app.listen(3000, () => {
  debug('Server started on http://localhost:3000')
  connectTxnDb()
    .then(() => debug('Connected to transaction mongodb.'))
    .catch((e) => debug('Failed to connect to transaction mongodb:', e))
})
