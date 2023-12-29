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
    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}

// like/unlike post controller
export const likeUnlikePost = async (req, res) => {
  try {
    // const {id:postId} = req.params
    const postId = req.params.id
    const userId = req.user._id

    // find the post by mongoose findById method
    const post = await Post.findById(postId)

    // if post not found return 404
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // check if user already liked the post (check if userId present in likes array)
    const userLikedPost = post.likes.includes(userId) // boolean value => true/false

    if (userLikedPost) {
      // unlike the post

      // remove userId using $pull from likes array where _id of post => postId
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
      res.status(200).json({ message: 'Post unliked successfully' })
    } else {
      // like the post
      // add userId to likes array of post
      post.likes.push(userId)
      await post.save()
      res.status(200).json({ message: 'Post liked successfully' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}

// reply to post method/controller
export const replyToPost = async (req, res) => {
  try {
    const { text } = req.body
    // const {id:postId} = req.params
    const postId = req.params.id
    // get user details from middleware
    const userId = req.user._id
    const userProfilePic = req.user.profilePicture
    const username = req.user.username

    if (!text) return res.status(400).json({ message: 'Text cannot be empty' })

    // find the post by mongoose findById method
    const post = await Post.findById(postId)

    // if post not found return 404
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // create a reply object to push
    const reply = { userId, text, userProfilePic, username }

    // push reply object to replies array inside post
    post.replies.push(reply)
    await post.save()

    res.status(200).json({ message: 'Reply added successfully', post })
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}

export const getFeedPosts = async (req, res) => {
  try {
    // console.log(req)
    const userId = req.user._id
    // console.log(userId)
    const user = await User.findById(userId)

    if (!user) return res.status(404).json({ message: 'User not found' })

    // following array => people the user is following
    const following = user.following
    // find all posts that are posted by people the user is following and sort by createdAt date in descending order
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({createdAt:-1})

    res.status(200).json({message:"feed",feedPosts})
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}

export const getUserPosts = async (req, res) => {
  const { username } = req.params
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    })

    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}