import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { messageValidation, idValidation } from '../middleware/validate.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);

router.route('/')
  .post(protect, messageValidation.create, sendMessage);

router.get('/user/:userId', protect, getMessages);

router.route('/:id')
  .delete(protect, idValidation, deleteMessage);

router.put('/:id/read', protect, idValidation, markAsRead);

export default router;
