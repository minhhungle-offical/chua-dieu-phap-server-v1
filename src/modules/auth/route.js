import express from 'express'
import { login } from './controllers/login.js'
import { getMe } from './controllers/getMe.js'
import { verifyOtp } from './controllers/verifyOtp.js'
import { resendOtp } from './controllers/resendOtp.js'
import { updateMe } from './controllers/updateMe.js'
import { checkAuth } from '../../middlewares/checkAuth.js'

const authRouter = express.Router()

authRouter.post('/login', login)
authRouter.post('/verify-otp', verifyOtp)
authRouter.post('/resend-otp', resendOtp)
authRouter.get('/me', checkAuth, getMe)
authRouter.put('/me', checkAuth, updateMe)

export default authRouter
