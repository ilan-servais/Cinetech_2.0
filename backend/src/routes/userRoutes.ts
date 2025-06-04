import express from 'express';
import { getWatchedItems, getWatchLaterItems, getFavorites } from '../controllers/userStatusController';
import { getCurrentUser, updateAvatarController } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';
import { uploadAvatar } from '../middlewares/avatarMulter';

const router = express.Router();
// Routes sécurisées avec token
router.get('/favorites', verifyToken, getFavorites);
router.get('/watched', verifyToken, getWatchedItems);
router.get('/watchlater', verifyToken, getWatchLaterItems);
router.get('/me', verifyToken, getCurrentUser);
router.post('/upload-avatar', verifyToken, uploadAvatar.single('avatar'), updateAvatarController);

export default router;
