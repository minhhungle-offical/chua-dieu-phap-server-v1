import mongoose from 'mongoose'

export const POST_STATUSES = ['draft', 'published', 'archived']

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    publicId: {
      type: String,
    },
    status: {
      type: String,
      enum: POST_STATUSES,
      default: 'draft',
    },
    tags: {
      type: String,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model('Post', schema)
export default User
