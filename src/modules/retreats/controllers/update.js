import * as yup from 'yup'
import { generateUniqueSlug } from '../../../helpers/slugHelper.js'
import Retreat from '../../../models/Retreat.js'

import { throwError } from '../../../utils/throwError.js'
import { deleteImage } from '../../../middlewares/upload.js'

const schema = yup.object({
  name: yup.string(),
  description: yup.string().default(''),
  type: yup
    .string()
    .oneOf(['bqt', 'phat-that', 'thien', 'summer', 'gieo-duyen', 'hoc-phap', 'khac']),
  status: yup.string().oneOf(['draft', 'published', 'archived']),
  startDate: yup.date(),
  endDate: yup.date().min(yup.ref('startDate'), 'endDate must be after startDate'),
  location: yup.string(),
  capacity: yup.number(),
})

export const update = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) throwError('Unauthorized', 401)

    const { id } = req.params
    const body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const retreat = await Retreat.findById(id)
    if (!retreat) throwError('Khóa tu không tồn tại', 404)

    if (body.name && body.name !== retreat.name) {
      body.slug = await generateUniqueSlug(body.name, Retreat, retreat._id)
    }

    if (req.imageUrl && req.publicId) {
      if (retreat.publicId) {
        await deleteImage(retreat.publicId)
      }

      body.imageUrl = req.imageUrl
      body.publicId = req.publicId
    }

    const updated = await Retreat.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: 'Cập nhật khóa tu thành công',
      data: updated,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors,
      })
    }
    next(error)
  }
}
