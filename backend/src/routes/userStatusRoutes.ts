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

// GET /user/status => retourne tous les statuts de l'utilisateur connecté
router.get('/', verifyToken, getAllStatuses);
// GET /api/user/status/:type/:mediaId
router.get('/:type/:mediaId', verifyToken, getMediaStatus);
// POST /api/user/status/toggle
router.post('/toggle', verifyToken, toggleStatus);
// GET /api/user/favorite
router.get('/favorite', verifyToken, getFavorites);
// DELETE /user/status/:status/:mediaType/:mediaId
router.delete('/:status/:mediaType/:mediaId', verifyToken, removeStatus);

export default router;
