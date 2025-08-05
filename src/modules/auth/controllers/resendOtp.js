import * as yup from 'yup'
import User from '../../../models/User.js'
import { generateOTP, hashOTP } from '../../../utils/otp.js'
import { sendOtpByEmail } from '../../../utils/sendMailOtp.js'
import { throwError } from '../../../utils/throwError.js'

const OTP_DURATION_MINUTES = 5
const OTP_RESEND_LIMIT_MS = 4 * 60 * 1000

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Email không hợp lệ')
    .required('Email không được bỏ trống'),
})

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const user = await User.findOne({ email })
    if (!user) throwError('Không tìm thấy người dùng', 404)

    const now = new Date()

    if (user.otpExpireAt && user.otpExpireAt > now) {
      const timeLeft = user.otpExpireAt.getTime() - now.getTime()
      if (timeLeft > OTP_RESEND_LIMIT_MS) {
        const waitMinutes = Math.ceil(timeLeft / 60_000)
        throwError(
          `Mã OTP đã được gửi. Vui lòng chờ thêm ${waitMinutes} phút trước khi yêu cầu lại.`,
          429,
        )
      }
    }

    const otp = generateOTP()
    const otpHash = await hashOTP(otp)
    const otpExpireAt = new Date(now.getTime() + OTP_DURATION_MINUTES * 60 * 1000)

    user.otpHash = otpHash
    user.otpExpireAt = otpExpireAt
    await user.save()

    await sendOtpByEmail(email, otp)

    res.status(200).json({
      success: true,
      message: 'Gửi lại mã OTP thành công',
      data: {
        email,
        ...(process.env.NODE_ENV !== 'production' && { otp }), // Chỉ hiển thị OTP trong môi trường dev
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
