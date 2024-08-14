/** Database connection and schemas. */

import mg from 'mongoose'
import { MONGO_URI } from './env'

await mg.connect(MONGO_URI)

const TestObjSchema = new mg.Schema({
  name: String,
  age: Number,
})

export const TestObj = mg.model('TestObj', TestObjSchema)
