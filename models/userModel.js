import mongoose from 'mongoose'

// blueprint of user
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    // creates a created at and updated at field
    timestamps: true,
  }
)

// create the model
const User = mongoose.model('User', userSchema)

export default User
