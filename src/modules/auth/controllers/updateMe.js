import * as yup from 'yup'
import User from '../../../models/User.js'
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
  maritalStatus: yup
    .string()
    .oneOf(
      ['single', 'married', 'widowed', 'divorced', 'other'],
      'Tình trạng hôn nhân không hợp lệ',
    ),
})

export const updateMe = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) throwError('Không được phép truy cập', 401)

    const updateData = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select('-otpHash -otpExpireAt')

    if (!user) {
      throwError('Không tìm thấy người dùng', 404)
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: user,
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
