import { Elysia } from 'elysia'
import _ from 'lodash-es'
import mg from 'mongoose'
import { TestObj } from './db'
import { NODE_ENV } from './env'

const app = new Elysia().get('/', () => 'Hello Elysia').listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} ` +
    `on Bun v${Bun.version} ` +
    `in ${NODE_ENV} mode.`,
)

const testId = mg.Types.ObjectId.createFromTime(0)

const oldObj = await TestObj.findById(testId).exec()
if (oldObj) {
  console.log(`Found previous test object: ${oldObj}`)
  await oldObj.deleteOne().exec()
} else console.log('No previous test object found')

const newObj = new TestObj({
  _id: testId,
  name: 'test1',
  age: _.random(1, 100),
})
console.log(`Saving new test object: ${newObj}`)
newObj.save({})
