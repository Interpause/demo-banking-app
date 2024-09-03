/** Parse/validate environment variables and also declare any typescript type overrides. */

import 'dotenv/config' // Load env vars, must be first.

import assert from 'assert/strict'
import createDebug from 'debug'

const debug = createDebug('app:env')

const _mongoUri = process.env.MONGO_URI
assert(
  typeof _mongoUri !== 'undefined',
  'MONGO_URI environment variable is required',
)

/** Server mode. Defaults to "development" if not specified via the NODE_ENV environment variable. */
export const NODE_ENV = process.env.NODE_ENV ?? 'development'
/** URI (including db user & password) to MongoDB server. Treat the environment variable as secret! */
export const MONGO_URI = _mongoUri

debug('NODE_ENV:', NODE_ENV)
debug('MONGO_URI:', MONGO_URI)
