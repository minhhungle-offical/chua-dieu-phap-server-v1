import express from 'express'
import { create } from './controllers/create.js'
import { getAll } from './controllers/getAll.js'
import { getBySlug } from './controllers/getBySlug.js'
import { remove } from './controllers/remove.js'
import { update } from './controllers/update.js'
import { createImageUploader } from '../../middlewares/upload.js'
import { checkAuth } from '../../middlewares/checkAuth.js'

const retreatRouter = express.Router()

retreatRouter.post('/', checkAuth, ...createImageUploader({ folder: 'retreats' }), create)
retreatRouter.get('/', getAll)
retreatRouter.get('/:slug', getBySlug)
retreatRouter.put('/:id', checkAuth, ...createImageUploader({ folder: 'retreats' }), update)
retreatRouter.delete('/:id', checkAuth, remove)

export default retreatRouter
