import User from '../../../models/User.js'
import { throwError } from '../../../utils/throwError.js'

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      throwError('Không được phép truy cập', 401)
    }

    const user = await User.findById(userId).select('-password')
    if (!user) {
      throwError('Không tìm thấy người dùng', 404)
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    })
  } catch (error) {
    next(error)
  }
}
