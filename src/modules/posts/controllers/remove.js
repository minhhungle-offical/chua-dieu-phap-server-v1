import { deleteImage } from '../../../middlewares/upload.js'
import Post from '../../../models/Post.js'
import { throwError } from '../../../utils/throwError.js'

export const remove = async (req, res, next) => {
  try {
    const { slug } = req.params
    const userId = req.user?._id
    const isAdmin = req.user?.role === 'owner'

    const post = await Post.findOne({ slug })
    if (!post) throwError('Bài viết không tồn tại', 404)

    if (!isAdmin && String(post.createdBy) !== String(userId)) {
      throwError('Bạn không có quyền xoá bài viết này', 403)
    }

    if (post.publicId) {
      await deleteImage(post.publicId)
    }

    await post.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Xoá bài viết thành công',
    })
  } catch (error) {
    next(error)
  }
}
