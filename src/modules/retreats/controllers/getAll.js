import Retreat from '../../../models/Retreat.js'

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filters = {}

    if (req.query.search) {
      filters.name = { $regex: req.query.search, $options: 'i' }
    }

    if (req.query.type) {
      filters.type = req.query.type
    }

    if (req.query.status) {
      filters.status = req.query.status
    }

    if (req.query.createdBy) {
      filters.createdBy = req.query.createdBy
    }

    const [retreats, total] = await Promise.all([
      Retreat.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Retreat.countDocuments(filters),
    ])

    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách khóa tu thành công',
      data: {
        data: retreats,
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
