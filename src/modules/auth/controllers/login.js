import * as yup from 'yup'
import User from '../../../models/User.js'
import { generateOTP, hashOTP } from '../../../utils/otp.js'
import { sendOtpByEmail } from '../../../utils/sendMailOtp.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email không được bỏ trống'),
  role: yup.string().optional(),
})

export const login = async (req, res, next) => {
  try {
    const { email, role } = await schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    })

    const isPrivileged = role && role !== 'member'
    let user = await User.findOne({ email })

    if (!user) {
      if (isPrivileged) {
        throwError('Không tìm thấy người dùng', 404)
      }

      user = await User.create({
        email,
        role: 'member',
      })
    }

    const otp = generateOTP()
    const otpHash = await hashOTP(otp)
    const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000)

    user.otpHash = otpHash
    user.otpExpireAt = otpExpireAt
    await user.save()

    await sendOtpByEmail(email, otp)

    return res.status(200).json({
      success: true,
      message: 'Mã OTP đã được gửi tới email của bạn',
      data: {
        email,
        ...(process.env.NODE_ENV !== 'production' && { otp }),
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
