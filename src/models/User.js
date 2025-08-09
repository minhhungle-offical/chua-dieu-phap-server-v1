import { Schema, model } from 'mongoose'

export const MARITAL_STATUSES = ['single', 'married', 'widowed', 'divorced', 'other']
export const GENDER = ['male', 'female', 'other']
export const ROLE = ['owner', 'admin', 'member']
export const STATUS_OPTIONS = ['active', 'inactive', 'banned']

const schema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ROLE, required: true },

    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: GENDER },

    avatarUrl: { type: String },
    publicId: { type: String },
    status: { type: String, enum: STATUS_OPTIONS, default: 'active' },
    isVerified: { type: Boolean, default: false },

    otpHash: { type: String },
    otpExpireAt: { type: Date },

    // member
    dharmaName: { type: String, trim: true },
    dateOfBirth: { type: Date },
    address: { type: String, trim: true },
    occupation: { type: String, trim: true },
    maritalStatus: { type: String, enum: MARITAL_STATUSES },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

schema.index({ email: 1 }, { unique: true, sparse: true })
schema.index({ phone: 1 }, { unique: true, sparse: true })
schema.index({ fullName: 1 })

export const User = model('User', schema)
export default User
