// filepath: /Users/vineet/projects/dhaage/dhaage_backend/index.js
import passport from 'passport'
import './utils/config/passport.js'  // Updated path to passport config

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
app.use(express.json({ limit: '50mb' })) //parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })) //usually parses form data extended:true used to parse nested data if present
app.use(cookieParser()) //parse cookies

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// CORS configuration
var allowedOrigins = [
  'https://dhaage-backend.vercel.app',
  'https://dhaage.vercel.app',
  'https://dhaage.netlify.app',
  'http://localhost:3000',
]
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    credentials: true,
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
