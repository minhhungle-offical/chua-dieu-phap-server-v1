import Post from '../../../models/Post.js'
import { throwError } from '../../../utils/throwError.js'

export const getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const post = await Post.findOne({ slug }).populate('createdBy', 'name email')

    if (!post) {
      throwError('Bài viết không tồn tại', 404)
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy bài viết thành công',
      data: post,
    })
  } catch (error) {
    next(error)
  }
}
