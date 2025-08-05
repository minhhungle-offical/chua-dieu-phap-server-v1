import express from 'express'
import { create } from './controllers/create.js'
import { getAll } from './controllers/getAll.js'
import { getById } from './controllers/getById.js'
import { remove } from './controllers/remove.js'
import { update } from './controllers/update.js'

const userRouter = express.Router()

userRouter.get('/', getAll)
userRouter.post('/', create)
userRouter.get('/:id', getById)
userRouter.put('/:id', update)
userRouter.delete('/:id', remove)

export default userRouter
