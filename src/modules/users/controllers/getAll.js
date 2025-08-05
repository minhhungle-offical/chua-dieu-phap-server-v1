import User from '../../../models/User'

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { email, role, gender, maritalStatus, fullName } = req.query

    const filters = {}

    if (email) filters.email = { $regex: email, $options: 'i' }
    if (fullName) filters.fullName = { $regex: fullName, $options: 'i' }
    if (role) filters.role = role
    if (gender) filters.gender = gender
    if (maritalStatus) filters.maritalStatus = maritalStatus

    const [users, total] = await Promise.all([
      User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filters),
    ])

    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách thành công',
      data: {
        data: users,
        pagination: {
          total,
          totalPages,
          page,
          limit,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
