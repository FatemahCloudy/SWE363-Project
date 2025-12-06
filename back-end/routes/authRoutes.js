import express from 'express';
import { signup, login, logout, getMe, updateProfile, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { userValidation } from '../middleware/validate.js';

const router = express.Router();

router.post('/signup', userValidation.signup, signup);
router.post('/login', userValidation.login, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, userValidation.update, updateProfile);
router.put('/password', protect, updatePassword);

export default router;
