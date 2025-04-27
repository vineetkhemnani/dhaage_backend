import express from 'express'
import {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  handleGoogleLogin,
} from '../controllers/userController.js'
import protectRoute from '../middlewares/protectRoute.js'
import passport from 'passport'
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
      // Check if user exists in the request
      if (!req.user) {
        console.error('User not found in request after Google authentication')
        return res.redirect('/login?error=user_not_found')
      }
      
      // console.log(req.user)
      handleGoogleLogin(req,res)
    } catch (error) {
      console.error('Error in Google callback:', error)
      res.redirect('/login?error=google_auth_failed')
    }
  }
)

export default router
