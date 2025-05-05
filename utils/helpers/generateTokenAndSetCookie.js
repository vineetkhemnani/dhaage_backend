import jwt from 'jsonwebtoken'

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  })

  const isProduction = process.env.NODE_ENV === 'production' // Vercel sets NODE_ENV to 'production'

  res.cookie('jwt', token, {
    httpOnly: true, // Cannot be accessed by client-side scripts
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
    sameSite: isProduction ? 'none' : 'strict', // Must be 'none' for cross-site cookies
    secure: isProduction ? true : false, // Must be true if sameSite='none' (requires HTTPS)
    // domain: isProduction ? '.yourdomain.com' : undefined // Optional: Set if needed for subdomains, ensure frontend/backend share a parent domain if used. For Netlify/Vercel on different root domains, this is likely not applicable/needed.
  })

  return token
}

export default generateTokenAndSetCookie
