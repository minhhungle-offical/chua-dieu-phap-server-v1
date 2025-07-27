import { verifyToken } from '../utils/jwt.js'
import { throwError } from '../utils/throwError.js'

export const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    console.log('authHeader: ', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return throwError('Unauthorized', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}
