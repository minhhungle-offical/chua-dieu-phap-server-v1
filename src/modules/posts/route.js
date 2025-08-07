import express from 'express'
import { create } from './controllers/create.js'
import { getAll } from './controllers/getAll.js'
import { getBySlug } from './controllers/getBySlug.js'
import { update } from './controllers/update.js'
import { remove } from './controllers/remove.js'
import { checkAuth } from '../../middlewares/checkAuth.js'
import { createImageUploader } from '../../middlewares/upload.js'

const postRouter = express.Router()

postRouter.get('/', getAll)
postRouter.post('/:slug', getBySlug)
postRouter.post('/', checkAuth, ...createImageUploader({ folder: 'posts' }), create)
postRouter.put('/:id', checkAuth, ...createImageUploader({ folder: 'posts' }), update)
postRouter.delete('/:id', checkAuth, remove)

export default postRouter
