import Post from '../models/postModel.js'
import User from '../models/userModel.js'

export const createPost = async (req, res) => {
  try {
    const { postedBy, text, img } = req.body
    if (!postedBy || !text)
      return res.status(400).json({ message: 'Please fill all the fields' })

    //   find user in User model => if not found return 404 error
    // postedBy => contains id of user who made the post
    const user = await User.findById(postedBy)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // user cannot make a post for another user
    if (user._id.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Unauthorized to create post' })

    // maxLength of post check
    const maxLength = 500
    if (text.length > maxLength)
      return res.status(400).json({
        message: `Text length should be less than ${maxLength} characters`,
      })

    // create a new post using schema
    const newPost = new Post({ postedBy, text, img })
    // save new post
    await newPost.save()

    res.status(201).json({ message: 'New post created successfully', newPost })
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}


