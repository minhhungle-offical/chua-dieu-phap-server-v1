import * as yup from 'yup'
import { generateUniqueSlug } from '../../../helpers/slugHelper.js'
import Retreat from '../../../models/Retreat.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  name: yup.string().required(),
  description: yup.string().default(''),
  type: yup
    .string()
    .oneOf(['bqt', 'phat-that', 'thien', 'summer', 'gieo-duyen', 'hoc-phap', 'khac'])
    .default('khac'),
  status: yup.string().oneOf(['draft', 'published', 'archived']).default('draft'),
  startDate: yup.date().required(),
  endDate: yup.date().required().min(yup.ref('startDate'), 'endDate must be after startDate'),
  location: yup.string().default('Chùa Diệu Pháp'),
  capacity: yup.number().default(100),
})

export const create = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) throwError('Unauthorized', 401)

    const body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const slug = await generateUniqueSlug(body.name, Retreat)

    const retreat = await Retreat.create({
      ...body,
      slug,
      createdBy: userId,
      ...(req.imageUrl && { imageUrl: req.imageUrl }),
      ...(req.publicId && { publicId: req.publicId }),
    })

    res.status(201).json({
      success: true,
      message: 'Khóa tu đã được tạo thành công',
      data: retreat,
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
