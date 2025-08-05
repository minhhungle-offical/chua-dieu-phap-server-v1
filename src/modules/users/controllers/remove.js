import mongoose from 'mongoose'
import User from '../../../models/User.js'
import { deleteImage } from '../../../middlewares/upload.js'
import { throwError } from '../../../utils/throwError.js'

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params
    const currentUserId = req.user?._id
    const isAdmin = req.user?.role === 'owner'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throwError('ID không hợp lệ', 400)
    }

    const user = await User.findById(id)
    if (!user) throwError('Người dùng không tồn tại', 404)

    const isSelf = String(user._id) === String(currentUserId)
    if (!isAdmin && !isSelf) {
      throwError('Bạn không có quyền xoá người dùng này', 403)
    }

    if (user.publicId) {
      await deleteImage(user.publicId)
    }

    await user.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Xoá người dùng thành công',
    })
  } catch (error) {
    next(error)
  }
}
