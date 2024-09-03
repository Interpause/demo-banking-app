import cookieParser from 'cookie-parser'
import createDebug from 'debug'
import express, { json, urlencoded } from 'express'
import logger from 'morgan'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

const debug = createDebug('app:app')
createDebug.enable('app:*')

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.listen(3000, () => {
  debug('Server started on http://localhost:3000')
})
