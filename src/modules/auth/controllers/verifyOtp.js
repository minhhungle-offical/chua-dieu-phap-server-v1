import * as yup from 'yup'
import { throwError } from '../../../utils/throwError.js'
import { generateToken } from '../../../utils/jwt.js'

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Invalid email format')
    .required('Email is required'),
  otp: yup
    .string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must be numeric')
    .required('OTP is required'),
})

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    const user = await User.findOne({ email })
    if (!user) return throwError('User not found', 404)

    const isValid = await verifyOtpCode(email, otp)
    if (!isValid) return throwError('Invalid or expired OTP', 400)

    const payload = { _id: user._id, email: user.email, role: user.role }
    const token = generateToken(payload)

    res
      .status(200)
      .json({ success: true, message: 'OTP verified successfully', data: { user: payload, token } })
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
