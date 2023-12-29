import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'

import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'

dotenv.config()

connectDB()
const app = express()
const PORT = process.env.PORT || 5000

// middlewares
app.use(express.json()) //parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })) //usually parses form data extended:true used to parse nested data if present
app.use(cookieParser()) //parse cookies

// Routes
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
