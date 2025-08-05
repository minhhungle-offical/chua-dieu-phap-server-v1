import * as yup from 'yup'
import Post from '../../../models/Post.js'
import { generateUniqueSlug } from '../../../helpers/slugHelper.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  title: yup.string().required('Tiêu đề là bắt buộc'),
  content: yup.string().required('Nội dung không được để trống'),
  excerpt: yup.string().default(''),
  status: yup.string().oneOf(['draft', 'published', 'archived']).default('draft'),
  tags: yup.string().trim().lowercase(),
})

export const create = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) throwError('Unauthorized', 401)

    const body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const slug = await generateUniqueSlug(body.title, Post)

    const post = await Post.create({
      ...body,
      slug,
      createdBy: userId,
      ...(req.url && { imageUrl: req.url }),
      ...(req.publicId && { publicId: req.publicId }),
    })

    res.status(201).json({
      success: true,
      message: 'Bài viết đã được tạo thành công',
      data: post,
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
