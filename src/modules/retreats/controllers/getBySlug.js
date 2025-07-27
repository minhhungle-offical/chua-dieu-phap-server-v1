import Retreat from '../../../models/Retreat.js'
import { throwError } from '../../../utils/throwError.js'

export const getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const retreat = await Retreat.findOne({ slug }).populate('createdBy', 'fullName email')

    if (!retreat) {
      throwError('Khóa tu không tồn tại', 404)
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin khóa tu thành công',
      data: retreat,
    })
  } catch (error) {
    next(error)
  }
}
