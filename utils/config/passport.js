import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../../models/userModel.js'
import dotenv from 'dotenv'

// Ensure dotenv is configured early, ideally once in your main server file (server.js/index.js)
dotenv.config()

// --- Start Debug Logging ---
console.log('[Passport Config] Loading Google Strategy...')
const googleClientID = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const backendUrl = process.env.BACKEND_URL
const callbackURL = backendUrl
  ? `${backendUrl}/api/users/auth/google/callback`
  : null

console.log(
  `[Passport Config] GOOGLE_CLIENT_ID Loaded: ${googleClientID ? 'Yes' : 'NO!'}`
)
// Avoid logging the actual secret in production logs if possible, just confirm its presence
console.log(
  `[Passport Config] GOOGLE_CLIENT_SECRET Loaded: ${
    googleClientSecret ? 'Yes' : 'NO!'
  }`
)
console.log(`[Passport Config] BACKEND_URL: ${backendUrl || 'MISSING!'}`)
console.log(
  `[Passport Config] Calculated Callback URL: ${
    callbackURL || 'MISSING BACKEND_URL!'
  }`
)

if (!googleClientID || !googleClientSecret || !callbackURL) {
  console.error(
    '[Passport Config] CRITICAL ERROR: Missing necessary Google OAuth environment variables or BACKEND_URL.'
  )
}
// --- End Debug Logging ---

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientID, // Use the variable checked above
      clientSecret: googleClientSecret, // Use the variable checked above
      callbackURL: callbackURL, // Use the variable checked above
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('[Passport Verify Callback] Triggered.') // Log when callback runs
      try {
        if (!profile || !profile.emails || profile.emails.length === 0) {
          console.error(
            '[Passport Verify Callback] Google profile information incomplete (missing email).'
          )
          return done(new Error('Incomplete profile data from Google.'), null)
        }
        const email = profile.emails[0].value
        console.log(
          `[Passport Verify Callback] Processing Google login for email: ${email}`
        )

        const { id, displayName, photos } = profile

        // Find or create user in the database
        let user = await User.findOne({ email })

        if (!user) {
          user = new User({
            name: displayName,
            email: email,
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
        return done(null, user) // Ensure user is defined
      } catch (err) {
        console.error('[Passport Verify Callback] Error:', err)
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
    console.error('[Passport DeserializeUser] Error:', err)
    done(err, null)
  }
})
