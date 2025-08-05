import express from 'express'
import { create } from './controllers/create'
import { getAll } from './controllers/getAll'
import { getBySlug } from './controllers/getBySlug'
import { update } from './controllers/update'
import { remove } from './controllers/remove'

const postRouter = express.Router()

postRouter.get('/', getAll)
postRouter.post('/:slug', getBySlug)
postRouter.post('/', create)
postRouter.put('/:id', update)
postRouter.delete('/:id', remove)

export default postRouter
