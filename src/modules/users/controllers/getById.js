import mongoose from 'mongoose'
import User from '../../../models/User.js'
import { throwError } from '../../../utils/throwError.js'

export const getById = async (req, res, next) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throwError('ID người dùng không hợp lệ', 400)
    }

    const user = await User.findById(userId).select('-password -refreshToken')
    if (!user) {
      throwError('Không tìm thấy người dùng', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    })
  } catch (error) {
    next(error)
  }
}
