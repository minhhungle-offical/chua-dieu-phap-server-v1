import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'
import multer from 'multer'
import sharp from 'sharp'

config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const upload = multer({ storage: multer.memoryStorage() })

export const deleteImage = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
  })
}

export function createImageUploader({
  folder,
  fieldName = 'image',
  width = 800,
  targetSizeKB = 200,
  square = false,
}) {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        console.log('file', req.file)
        console.log('body', req.body)
        if (!req.file) return next()

        const resizeOptions = square
          ? { width, height: width, fit: 'cover' }
          : { width, fit: 'inside' }

        let buffer = await sharp(req.file.buffer)
          .resize(resizeOptions)
          .jpeg({ quality: 80 })
          .toBuffer()

        if (buffer.length > targetSizeKB * 1024) {
          buffer = await sharp(buffer).jpeg({ quality: 65 }).toBuffer()
        }

        const uploadToCloudinary = () =>
          new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: `chua-dieu-phap/${folder}`, format: 'webp' },
                (err, result) => {
                  if (err) return reject(err)

                  resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                  })
                },
              )
              .end(buffer)
          })

        const { url, publicId } = await uploadToCloudinary()

        req.url = url
        req.publicId = publicId
        next()
      } catch (err) {
        console.error('🚨 Image upload failed:', err)
        res.status(500).json({ error: 'Image upload failed' })
      }
    },
  ]
}
