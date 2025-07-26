import crypto from 'crypto'

export const hashOTP = async (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0')
}
