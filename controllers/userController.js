import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookie from '../utils/helpers/generateTokenAndSetCookie.js'
export const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body
    // find user on basis of either email or username object
    const user = await User.findOne({ $or: [{ email }, { username }] })
    if (user) {
      // if user exists return from function with error message
      return res.status(400).json({ message: 'User already exists' })
    }

    // generate a salt to be hased with password
    const salt = await bcrypt.genSalt(10)
    // generate hashed password with salt
    const hashedPassword = await bcrypt.hash(password, salt)

    // create a new user
    const newUser = new User({
      // name -> name: name,
      name,
      email,
      username,
      password: hashedPassword,
    })

    // save the new user in database
    await newUser.save()

    // if newUser exists/ newUser is created return status of 201 and userData
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res)
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log('Error in signupUser: ', err.message)
  }
}
