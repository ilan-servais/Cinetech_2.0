import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getMediaStatus,
  toggleStatus,
  getFavorites
} from '../controllers/userStatusController';

const router = express.Router();

// GET /api/user/status/:type/:mediaId
router.get('/status/:type/:mediaId', verifyToken, getMediaStatus);

// POST /api/user/status/toggle
router.post('/status/toggle', verifyToken, toggleStatus);

// GET /api/user/favorite
router.get('/favorite', verifyToken, getFavorites);

export default router;
