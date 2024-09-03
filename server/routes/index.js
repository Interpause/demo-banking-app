import { Router } from 'express'

const router = Router()

/** GET home page. */
router.get('/', function (_req, res, _next) {
  res.send('Hello World')
})

export default router
