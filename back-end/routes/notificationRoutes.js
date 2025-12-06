import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { idValidation } from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.delete('/clear-all', protect, clearAllNotifications);

router.route('/:id')
  .delete(protect, idValidation, deleteNotification);

router.put('/:id/read', protect, idValidation, markAsRead);

export default router;
