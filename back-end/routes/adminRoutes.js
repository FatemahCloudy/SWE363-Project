import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getReports,
  reviewReport,
  deleteMemoryAdmin
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);

router.get('/reports', getReports);
router.put('/reports/:id', reviewReport);

router.delete('/memories/:id', deleteMemoryAdmin);

export default router;
