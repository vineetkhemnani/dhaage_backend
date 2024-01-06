import express from 'express'
import {
  createPost,
  deletePost,
  getPost,
  likeUnlikePost,
  replyToPost,
    getFeedPosts,
  getUserPosts,
} from '../controllers/postController.js'
import protectRoute from '../middlewares/protectRoute.js'
const router = express.Router()

// endpoint to get his feed (posts of all users they are following)
router.get('/feed', protectRoute, getFeedPosts)
// endpoint to create a post
router.post('/create', protectRoute, createPost)
// endpoint to fetch a post using id
router.get('/:id', getPost)
// endpoint to delete a post using id
router.delete('/:id', protectRoute, deletePost)
// endpoint that acts when user likes/unlikes a post
router.put('/like/:id', protectRoute, likeUnlikePost)
// endpoint that acts when a user tries to add a reply
router.put('/reply/:id', protectRoute, replyToPost)
// endpoint that acts when a user tries to get his own posts
router.get('/user/:username', getUserPosts)
export default router
