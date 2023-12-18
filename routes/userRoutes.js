import express from 'express'
import { signupUser } from '../controllers/userController.js'
// server.js -> routes -> controllers
const router = express.Router()

// when you hit /api/users/signup below function executed
router.post('/signup', signupUser)

export default router
