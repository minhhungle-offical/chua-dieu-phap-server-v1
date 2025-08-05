import * as yup from 'yup'
import Post from '../../../models/Post.js'
import { throwError } from '../../../utils/throwError.js'
import { generateUniqueSlug } from '../../../helpers/slugHelper.js'

const schema = yup.object({
  title: yup.string(),
  content: yup.string(),
  excerpt: yup.string().default(''),
  status: yup.string().oneOf(['draft', 'published', 'archived']),
  tags: yup.array().of(yup.string().trim().lowercase()),
})

export const update = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) throwError('Unauthorized', 401)

    const { slug } = req.params

    const post = await Post.findOne({ slug })
    if (!post) throwError('Bài viết không tồn tại', 404)

    if (String(post.createdBy) !== String(userId)) {
      throwError('Không có quyền chỉnh sửa bài viết này', 403)
    }

    const body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (body.title && body.title !== post.title) {
      post.slug = await generateUniqueSlug(body.title, Post)
      post.title = body.title
    }

    if (body.content) post.content = body.content
    if (body.excerpt !== undefined) post.excerpt = body.excerpt
    if (body.status) post.status = body.status
    if (body.tags) post.tags = body.tags

    if (req.url) post.imageUrl = req.url
    if (req.publicId) post.publicId = req.publicId

    await post.save()

    res.status(200).json({
      success: true,
      message: 'Bài viết đã được cập nhật thành công',
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
