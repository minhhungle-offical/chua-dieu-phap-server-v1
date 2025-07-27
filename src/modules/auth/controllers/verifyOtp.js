import * as yup from 'yup'
import User from '../../../models/User.js'
import { hashOTP } from '../../../utils/otp.js'
import { generateToken } from '../../../utils/jwt.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Email không hợp lệ')
    .required('Email không được bỏ trống'),
  otp: yup
    .string()
    .length(6, 'OTP phải gồm đúng 6 chữ số')
    .matches(/^\d+$/, 'OTP chỉ được chứa số')
    .required('OTP không được bỏ trống'),
})

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const user = await User.findOne({ email })
    if (!user) throwError('Không tìm thấy người dùng', 404)

    if (!user.otpHash || !user.otpExpireAt) {
      return throwError('OTP chưa được tạo hoặc đã hết hạn', 400)
    }

    if (user.otpExpireAt < new Date()) {
      return throwError('OTP đã hết hạn', 400)
    }

    const hashed = await hashOTP(otp)
    const isMatch = hashed === user.otpHash

    if (!isMatch) {
      return throwError('OTP không chính xác', 400)
    }

    user.otpHash = undefined
    user.otpExpireAt = undefined
    await user.save()

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    }

    const token = generateToken(payload)

    return res.status(200).json({
      success: true,
      message: 'Xác thực OTP thành công',
      data: {
        user: payload,
        token,
      },
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
