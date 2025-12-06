import express from 'express';
import {
  createSharedMemory,
  respondToInvitation,
  addCollaborativeEntry,
  updateCollaborativeEntry,
  deleteCollaborativeEntry,
  getSharedGroup,
  getGroupEntries,
  getMySharedGroups,
  inviteCollaborator,
  removeCollaborator,
  updateGroupSettings,
  getFriendsForCollaboration
} from '../controllers/collaborativeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/friends', protect, getFriendsForCollaboration);

router.get('/my-groups', protect, getMySharedGroups);

router.post('/create', protect, createSharedMemory);

router.post('/groups/:groupId/respond', protect, respondToInvitation);

router.route('/groups/:groupId')
  .get(protect, getSharedGroup);

router.put('/groups/:groupId/settings', protect, updateGroupSettings);

router.route('/groups/:groupId/entries')
  .get(protect, getGroupEntries)
  .post(protect, addCollaborativeEntry);

router.route('/groups/:groupId/entries/:entryId')
  .put(protect, updateCollaborativeEntry)
  .delete(protect, deleteCollaborativeEntry);

router.post('/groups/:groupId/invite', protect, inviteCollaborator);

router.delete('/groups/:groupId/collaborators/:collaboratorId', protect, removeCollaborator);

export default router;
