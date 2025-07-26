import dotenv from 'dotenv'
dotenv.config()

import app from './src/app.js'
import mongoose from 'mongoose'

const port = process.env.PORT || 8080
const uri = process.env.MONGO_URI

;(async () => {
  try {
    await mongoose.connect(uri)
    console.log('🔗 Mongoose connected')

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  }
})()
