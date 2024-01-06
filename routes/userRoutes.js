import express from 'express'
import {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
} from '../controllers/userController.js'
import protectRoute from '../middlewares/protectRoute.js'
// server.js -> routes -> controllers
const router = express.Router()

// when you hit /api/users/profile/:query below function executed
// here query can be either username or userId(_id)
router.get('/profile/:query', getUserProfile)
// when you hit /api/users/signup below function executed
router.post('/signup', signupUser)
// when you hit /api/users/login below function executed
router.post('/login', loginUser)
// when you hit /api/users/logout below function executed => logs out the user
router.post('/logout', logoutUser)
// when you hit /api/users/follow/:id => follow-unfollow user using the dynamic id of the user
// protectRoute acts as a middleware => cannot follow someone if you are not logged in
router.post('/follow/:id', protectRoute, followUnfollowUser)
// when you hit /api/users/update/:id => update user using the dynamic id of the user
router.put('/update/:id', protectRoute, updateUser)

export default router
