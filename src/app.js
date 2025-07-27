import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import authRouter from './modules/auth/route.js'
import retreatRouter from './modules/retreats/route.js'
import { corsOptions } from './utils/corsOption.js'

const app = express()

// Middlewares
app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/retreats', retreatRouter)

// 404 Handler
app.use((req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`)
  err.status = 404
  next(err)
})

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  console.error('❌ Error:', message)
  if (process.env.NODE_ENV !== 'production') {
    console.error('📍 Stack trace:\n', err.stack)
  }

  res.status(status).json({
    success: false,
    message,
    // Only include stack in non-production
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
})

export default app
