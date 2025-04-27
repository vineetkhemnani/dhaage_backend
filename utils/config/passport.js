import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../../models/userModel.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8000/api/users/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile

        // Find or create user in the database
        let user = await User.findOne({ email: emails[0].value })

        if (!user) {
          user = new User({
            name: displayName,
            email: emails[0].value,
            username: `google_${id}`,
            profilePicture: photos[0].value,
            googleId: id,
          })
          await user.save()
        } else {
          // Update existing user's information
          user.name = displayName
          user.profilePicture = photos[0].value
          
          // If user doesn't have a googleId, add it
          if (!user.googleId) {
            user.googleId = id
          }
          
          await user.save()
        }
        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})