import express from 'express';
import {
  getSavedMemories,
  saveMemory,
  unsaveMemory,
  checkSaved
} from '../controllers/savedMemoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSavedMemories);

router.route('/:memoryId')
  .post(protect, saveMemory)
  .delete(protect, unsaveMemory);

router.get('/:memoryId/check', protect, checkSaved);

export default router;
