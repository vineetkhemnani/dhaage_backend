import jwt from 'jsonwebtoken'
const generateTokenAndSetCookie = (userId, res) => {
    // function to generate cookie based on userId as userId is unique
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  })
  // create a cookie(nameOfCookie,cookieValue,options)
  res.cookie('jwt', token, {
    httpOnly: true, //more secure -> cookie cannot be accessed by the browser
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    sameSite: 'strict', //CSRF
  })

  return token
}

export default generateTokenAndSetCookie
