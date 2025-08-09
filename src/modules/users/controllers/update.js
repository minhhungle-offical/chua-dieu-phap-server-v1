import * as yup from 'yup'
import mongoose from 'mongoose'
import User, { STATUS_OPTIONS } from '../../../models/User.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  fullName: yup.string().trim(),
  phone: yup.string().trim(),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Giới tính không hợp lệ'),
  avatarUrl: yup.string().url('Đường dẫn avatar không hợp lệ'),
  publicId: yup.string(),
  dharmaName: yup.string().trim(),
  dateOfBirth: yup.date().typeError('Ngày sinh không hợp lệ'),
  address: yup.string().trim(),
  occupation: yup.string().trim(),
  isActive: yup.string().oneOf(STATUS_OPTIONS, 'Trạng thái không hợp lệ'),
  maritalStatus: yup
    .string()
    .oneOf(
      ['single', 'married', 'widowed', 'divorced', 'other'],
      'Tình trạng hôn nhân không hợp lệ',
    ),
})

export const update = async (req, res, next) => {
  try {
    const { id: userId } = req.params
    const currentUserId = req.user?._id
    const isAdmin = req.user?.role === 'owner'

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throwError('ID không hợp lệ', 400)
    }

    const isSelf = String(currentUserId) === String(userId)
    if (!isAdmin && !isSelf) {
      throwError('Bạn không có quyền chỉnh sửa thông tin người dùng này', 403)
    }

    // Validate input
    const updateData = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select('-otpHash -otpExpireAt')

    if (!updatedUser) {
      throwError('Không tìm thấy người dùng', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser,
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
