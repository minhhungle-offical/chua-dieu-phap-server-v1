import express from 'express'
import { getAll } from './controllers/getAll.js'
const retreatRouter = express.Router()

retreatRouter.get('/', getAll)

export default retreatRouter
