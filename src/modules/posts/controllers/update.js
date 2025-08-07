import * as yup from 'yup'
import Post from '../../../models/Post.js'
import { throwError } from '../../../utils/throwError.js'
import { generateUniqueSlug } from '../../../helpers/slugHelper.js'

const schema = yup.object({
  title: yup.string(),
  content: yup.string(),
  excerpt: yup.string().default(''),
  status: yup.string().oneOf(['draft', 'published', 'archived']),
  tags: yup.string().trim().lowercase(),
})

export const update = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) throwError('Unauthorized', 401)

    const { id } = req.params

    const post = await Post.findById(id)
    if (!post) throwError('Bài viết không tồn tại', 404)

    if (String(post.createdBy) !== String(userId)) {
      throwError('Không có quyền chỉnh sửa bài viết này', 403)
    }

    const body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const updateFields = {}

    if (body.title && body.title !== post.title) {
      updateFields.title = body.title
      updateFields.slug = await generateUniqueSlug(body.title, Post)
    }

    if ('content' in body) updateFields.content = body.content
    if ('excerpt' in body) updateFields.excerpt = body.excerpt
    if ('status' in body) updateFields.status = body.status
    if ('tags' in body) updateFields.tags = body.tags

    if (req.imageUrl) updateFields.imageUrl = req.imageUrl
    if (req.publicId) updateFields.publicId = req.publicId

    const updatedPost = await Post.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true },
    )

    res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: updatedPost,
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
