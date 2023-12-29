import Post from '../models/postModel.js'
import User from '../models/userModel.js'

// method/controller to create a post
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

// method/controller to get a post
export const getPost = async (req, res) => {
  // extract dynamic id from params
  const { id } = req.params
  try {
    // find the post by mongoose findById method
    const post = await Post.findById(id)

    // if post not found return 404
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // status 200 means okay => return post as response
    res.status(200).json({ post })
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}

// controller/method to delete a post
export const deletePost = async (req, res) => {
  // extract dynamic id from params
  const { id } = req.params
  try {
    // find the post by mongoose findById method
    const post = await Post.findById(id)

    // if post not found return 404
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // check if the person who posted is the one trying to delete the post
    if (post.postedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Unauthorized to delete post' })

    // find the post by id and delete the post
    await Post.findByIdAndDelete(id)

    // status 200 means okay => return post as response
    res.status(200).json({ message: "Post deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}
