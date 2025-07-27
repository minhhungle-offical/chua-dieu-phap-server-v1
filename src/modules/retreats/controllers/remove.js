import Retreat from '../../../models/Retreat.js'
import { throwError } from '../../../utils/throwError.js'
import { deleteImage } from '../../../utils/cloudinary.js'

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user?._id
    const isAdmin = req.user?.role === 'owner'

    const retreat = await Retreat.findById(id)
    if (!retreat) throwError('Khóa tu không tồn tại', 404)

    if (!isAdmin && String(retreat.createdBy) !== String(userId)) {
      throwError('Bạn không có quyền xoá khóa tu này', 403)
    }

    if (retreat.publicId) {
      await deleteImage(retreat.publicId)
    }

    await retreat.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Xoá khóa tu thành công',
    })
  } catch (error) {
    next(error)
  }
}
