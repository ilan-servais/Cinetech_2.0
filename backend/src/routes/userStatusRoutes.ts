import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getMediaStatus,
  toggleStatus,
  getFavorites,
  removeStatus,
  getAllStatuses
} from '../controllers/userStatusController';

const router = express.Router();

// GET /api/user/status => retourne tous les statuts de l'utilisateur connecté
router.get('/', verifyToken, getAllStatuses);

// GET /api/user/status/:mediaType/:mediaId
// Note: Changed parameter name from :type to :mediaType to match controller expectations
router.get('/:mediaType/:mediaId', verifyToken, getMediaStatus);

// POST /api/user/status/toggle
router.post('/toggle', verifyToken, toggleStatus);

// GET /api/user/status/favorites
router.get('/favorites', verifyToken, getFavorites);

// DELETE /api/user/status/:status/:mediaType/:mediaId
router.delete('/:status/:mediaType/:mediaId', verifyToken, removeStatus);

export default router;
