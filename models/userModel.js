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
      required: function() {
        // Password is required only if not using Google OAuth
        return !this.googleId;
      },
      validate: {
        validator: function(v) {
          // Skip validation if this is a Google OAuth user
          if (this.googleId) return true;
          // Otherwise, ensure password meets minimum length
          return v.length >= 6;
        },
        message: 'Password must be at least 6 characters long'
      }
    },
    googleId: {
      type: String,
      sparse: true,
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
