import Post from '../../../models/Post.js'

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filters = {}

    if (req.query.search) {
      filters.title = { $regex: req.query.search, $options: 'i' }
    }

    if (req.query.status) {
      filters.status = req.query.status
    }

    if (req.query.createdBy) {
      filters.createdBy = req.query.createdBy
    }

    if (req.query.tag) {
      filters.tags = req.query.tag
    }

    const [posts, total] = await Promise.all([
      Post.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Post.countDocuments(filters),
    ])

    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      data: {
        data: posts,
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
