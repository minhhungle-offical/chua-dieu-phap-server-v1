import * as yup from 'yup'
import User from '../../../models/User'
import { throwError } from '../../../utils/throwError'

const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email không được bỏ trống'),
  role: yup.string().optional(),
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

export const create = async (req, res, next) => {
  try {
    const { email, ...rest } = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throwError('Email đã tồn tại')
    }

    const newUser = new User({
      email,
      ...rest,
      ...(req.url && { avatarUrl: req.url }),
      ...(req.publicId && { publicId: req.publicId }),
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: newUser,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors,
      })
    }

    next(error)
  }
}
