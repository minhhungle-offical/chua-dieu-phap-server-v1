import * as yup from 'yup'
import { generateUniqueSlug } from '../../../helpers/slugHelper.js'
import Retreat from '../../../models/Retreat.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  name: yup.string().required('Name là trường bắt buộc'),
  description: yup.string().default(''),
  type: yup
    .string()
    .oneOf(['bqt', 'phat-that', 'thien', 'summer', 'gieo-duyen', 'hoc-phap', 'khac'])
    .default('khac'),
  status: yup.string().oneOf(['draft', 'published', 'archived']).default('draft'),
  startTime: yup
    .string()
    .required('Giờ bắt đầu là bắt buộc')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ bắt đầu không hợp lệ'),
  endTime: yup
    .string()
    .required('Giờ kết thúc là bắt buộc')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ kết thúc không hợp lệ')
    .test('is-after-startTime', 'Giờ kết thúc phải sau giờ bắt đầu', function (value) {
      const { startTime } = this.parent
      if (!startTime || !value) return true
      return value > startTime
    }),
  startDate: yup.date().required(),
  endDate: yup
    .date()
    .required()
    .min(yup.ref('startDate'), 'endDate phải lớn hơn hoặc bằng startDate'),
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
      ...(req.url && { imageUrl: req.url }),
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
