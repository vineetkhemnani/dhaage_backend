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
import passport from 'passport'
import generateTokenAndSetCookie from '../utils/helpers/generateTokenAndSetCookie.js'
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

// Google OAuth routes
router.get(
  '/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
)

router.get(
  '/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/login',
      session: true
    })(req, res, next)
  },
  (req, res) => {
    try {
      // Generate JWT token and set cookie using the helper function
      generateTokenAndSetCookie(req.user._id, res)
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success`)
    } catch (error) {
      console.error('Error in Google callback:', error)
      res.redirect('/login?error=google_auth_failed')
    }
  }
)

export default router
