import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getMediaStatus,
  getFavorites,
  getWatchedItems,
  getWatchLaterItems,
  removeFavorite,
  removeWatched,
  removeWatchLater
} from '../controllers/userStatusController';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(verifyToken);

// Routes pour récupérer le statut d'un média
router.get('/status/:mediaType/:mediaId', getMediaStatus);

// Routes pour les favoris
router.post('/favorites/toggle', toggleFavorite);
router.get('/favorites', getFavorites);
router.delete('/favorites/:mediaType/:mediaId', removeFavorite);

// Routes pour les médias déjà vus
router.post('/watched/toggle', toggleWatched);
router.get('/watched', getWatchedItems);
router.delete('/watched/:mediaType/:mediaId', removeWatched);

// Routes pour les médias à voir plus tard
router.post('/watchlater/toggle', toggleWatchLater);
router.get('/watchlater', getWatchLaterItems);
router.delete('/watchlater/:mediaType/:mediaId', removeWatchLater);

export default router;
