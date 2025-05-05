// filepath: /Users/vineet/projects/dhaage/dhaage_backend/index.js
import passport from 'passport'
import './utils/config/passport.js'
import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import session from 'express-session'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import { v2 as cloudinary } from 'cloudinary'
dotenv.config()

connectDB()
const app = express()
const PORT = process.env.PORT || 5000

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// middlewares
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// CORS configuration - MOVE THIS ABOVE session and passport middleware
const allowedOrigins = [
  'https://dhaage-backend.vercel.app',
  'https://dhaage.vercel.app',
  'https://dhaage.netlify.app',
  'http://localhost:3000',
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  })
)

// Session middleware - UPDATED cookie settings
app.use(
  session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // IMPORTANT for cross-domain
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    proxy: process.env.NODE_ENV === 'production', // Trust the proxy in production
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/', (req, res) => {
  res.send('Hello')
})

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
