import * as yup from 'yup'
import User from '../../../models/User.js'
import { generateOTP, hashOTP } from '../../../utils/otp.js'
import { sendOtpByEmail } from '../../../utils/sendMailOtp.js'
import { throwError } from '../../../utils/throwError.js'

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Invalid email format')
    .required('Email is required'),
})

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = await schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    })

    const user = await User.findOne({ email })
    if (!user) throwError('User not found', 404)

    const otp = generateOTP()
    user.otpHash = await hashOTP(otp)
    user.otpExpireAt = new Date(Date.now() + 5 * 60 * 1000)

    await user.save()
    await sendOtpByEmail(email, otp)

    return res.status(200).json({
      success: true,
      message: 'OTP has been sent',
      data: {
        email,
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      },
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      })
    }
    next(error)
  }
}
