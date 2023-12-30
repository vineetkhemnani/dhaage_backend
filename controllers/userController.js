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
      return res.status(400).json({ error: 'User already exists' })
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
      res.status(400).json({ error: 'Invalid user data' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
    console.log('Error in signupUser: ', err.message)
  }
}

// login user function
export const loginUser = async (req, res) => {
  try {
    // get username and password from body
    const { username, password } = req.body
    // find user from database using username
    const user = await User.findOne({ username })
    // if password is correct/not
    // if wrong username then user will be null hence compare empty string with password for that
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ''
    )

    // if no user or password not correct return from function
    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: 'Invalid username or password' })
    generateTokenAndSetCookie(user._id, res)
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
    console.log('Error in loginUser: ', err.message)
  }
}

// logs out user by clearing the cookie
export const logoutUser = async (req, res) => {
  try {
    // clear the cookie
    res.cookie('jwt', '', { maxAge: 1 })
    res.status(200).json({ message: 'User logged out successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
    console.log('Error in logoutUser: ', err.message)
  }
}

// follow unfollow user function
export const followUnfollowUser = async (req, res) => {
  try {
    // get dynamic id from req params
    const { id } = req.params
    const userToModify = await User.findById(id)
    const currentUser = await User.findById(req.user._id)

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: 'You cannot follow/unfollow yourself' })

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: 'User not found' })

    // checks if following of currentUser includes id
    const isFollowing = currentUser.following.includes(id)

    if (isFollowing) {
      // unfollow
      // modify current users following, and modify followers array of userToModify
      // current user => us
      // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
      // Suppose John follows Jane , so remove Jane from John's following array

      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
      // remove John from Jane's followers

      res.status(200).json({ message: 'User unfollowed successfully' })
    } else {
      // follow
      // $push operator adds item to an existing array
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      })
      // above adds Jane to John's following list
      // so John is following Jane

      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      })
      // above adds John to Jane's followers
      // Jane has John as a follower

      res.status(200).json({ message: 'User followed successfully' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
    console.log('Error in followUnfollowUser: ', err.message)
  }
}

// update user
export const updateUser = async (req, res) => {
  const { name, email, username, password, profilePicture, bio } = req.body
  const userId = req.user._id
  try {
    let user = await User.findById(userId)
    // early return if user not found
    if (!user) return res.status(400).json({ error: 'User not found' })

    // protect other user's privacy
    // convert userId to string becoz its an OBJECT
    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update another user's profile" })

    // if password is being changed, hash it before storing
    if (password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
    }

    user.name = name || user.name
    user.email = email || user.email
    user.username = username || user.username
    user.profilePicture = profilePicture || user.profilePicture
    user.bio = bio || user.bio

    // modified user saved in user variable
    user = await user.save()

    res.status(200).json({ message: 'Profile updated successfully', user })
  } catch (err) {
    res.status(500).json({ error: err.message })
    console.log('Error in updateUser: ', err.message)
  }
}

// getting user profile
export const getUserProfile = async (req, res) => {
  const { username } = req.params
  try {
    // find user using username and select everything except the password
    const user = await User.findOne({ username })
      .select('-password')
      .select('-updatedAt')

    // if user not present return user not found
    if (!user) return res.status(400).json({ error: 'User not found' })

    // return user if status 200
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
    console.log('Error in getUserProfile: ', err.message)
  }
}
