import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getMediaStatus,
  toggleStatus,
  getFavorites,
  removeStatus,
  getAllStatuses,
  removeFavorite,
  removeWatched,
  removeWatchLater
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

// DELETE /api/user/status/favorites/:mediaType/:mediaId
router.delete('/favorites/:mediaType/:mediaId', verifyToken, removeFavorite);
router.delete('/watched/:mediaType/:mediaId', verifyToken, removeWatched);
router.delete('/watchlater/:mediaType/:mediaId', verifyToken, removeWatchLater);

export default router;
