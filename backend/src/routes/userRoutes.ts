import express from 'express';
import { getWatchedItems, getWatchLaterItems, getFavorites } from '../controllers/userStatusController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();
// Routes sécurisées avec token
router.get('/favorites', verifyToken, getFavorites);
router.get('/watched', verifyToken, getWatchedItems);
router.get('/watchlater', verifyToken, getWatchLaterItems);

export default router;
