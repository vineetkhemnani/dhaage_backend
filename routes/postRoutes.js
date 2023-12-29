import express from 'express'
import {
  createPost,
  deletePost,
  getPost,
  likeUnlikePost,
  replyToPost,
} from '../controllers/postController.js'
import protectRoute from '../middlewares/protectRoute.js'
const router = express.Router()

// endpoint to create a post
router.post('/create', protectRoute, createPost)
// endpoint to fetch a post using id
router.get('/:id', getPost)
// endpoint to delete a post using id
router.delete('/:id', protectRoute, deletePost)
// endpoint that acts when user likes/unlikes a post
router.post('/like/:id', protectRoute, likeUnlikePost)
// endpoint that acts when a user tries to add a reply
router.post('/reply/:id', protectRoute, replyToPost)

export default router
