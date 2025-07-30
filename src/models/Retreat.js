import mongoose from 'mongoose'

const RETREAT_TYPES = ['bqt', 'phat-that', 'thien', 'summer', 'gieo-duyen', 'hoc-phap', 'khac']
const RETREAT_STATUSES = ['draft', 'published', 'archived']

const retreatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: RETREAT_TYPES, default: 'khac' },
    status: { type: String, enum: RETREAT_STATUSES, default: 'draft' },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },

    location: { type: String, default: 'Chùa Diệu Pháp' },
    capacity: { type: Number, default: 100 },

    imageUrl: { type: String },
    publicId: { type: String },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Retreat', retreatSchema)
