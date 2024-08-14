/** Parse/validate environment variables and also declare any typescript type overrides. */

import assert from 'node:assert/strict'

declare module 'bun' {
  interface Env {
    MONGO_URI?: string
  }
}

const _mongoUri = Bun.env.MONGO_URI
assert(
  typeof _mongoUri !== 'undefined',
  'MONGO_URI environment variable is required',
)

/** Server mode. Defaults to "development" if not specified via the NODE_ENV environment variable. */
export const NODE_ENV = Bun.env.NODE_ENV ?? 'development'
/** URI (including db user & password) to MongoDB server. Treat the environment variable as secret! */
export const MONGO_URI = _mongoUri
