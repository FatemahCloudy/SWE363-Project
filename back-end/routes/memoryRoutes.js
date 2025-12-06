import express from 'express';
import {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
  searchMemories,
  getUserMemories,
  likeMemory,
  unlikeMemory,
  getLikes
} from '../controllers/memoryController.js';
import { getComments, createComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { memoryValidation, commentValidation, idValidation } from '../middleware/validate.js';

const router = express.Router();

router.get('/search', protect, searchMemories);

router.route('/')
  .get(protect, getMemories)
  .post(protect, memoryValidation.create, createMemory);

router.route('/:id')
  .get(protect, idValidation, getMemory)
  .put(protect, idValidation, memoryValidation.update, updateMemory)
  .delete(protect, idValidation, deleteMemory);

router.get('/user/:userId', protect, getUserMemories);

router.route('/:id/like')
  .post(protect, idValidation, likeMemory)
  .delete(protect, idValidation, unlikeMemory);

router.get('/:id/reactions', protect, idValidation, getLikes);

router.route('/:id/comments')
  .get(protect, getComments)
  .post(protect, commentValidation.create, createComment);

export default router;
