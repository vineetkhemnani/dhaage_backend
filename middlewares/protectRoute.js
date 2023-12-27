import User from "../models/userModel.js"
import jwt from "jsonwebtoken"
// serves as the middleware to authorize several functions to execute after authorization
const protectRoute = async (req, res, next) => {
  // if this function is successfully completed the next calls original function for example:- followUnfollowUser
  try {
    const token = req.cookies.jwt //jwt -> should be the same as in name in res.cookie("")

    // if no token means not logged in hence return error message "Unauthorized"
    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    // decode user using token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")
    req.user = user
    next()
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log('Error in protectRoute: ', err.message)
  }
}

export default protectRoute