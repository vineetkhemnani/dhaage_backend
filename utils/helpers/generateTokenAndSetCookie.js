import jwt from 'jsonwebtoken'

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  })

  // Add an environment check for secure flag
  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    sameSite: 'strict', // CSRF protection
    secure: isProduction, // Only set to true in production (HTTPS environments)
    // If your API and frontend are on different domains, you might need:
    // domain: process.env.COOKIE_DOMAIN // e.g. ".yourdomain.com"
  })

  return token
}
export default generateTokenAndSetCookie
