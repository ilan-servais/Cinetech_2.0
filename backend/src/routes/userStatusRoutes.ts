import express from 'express';
import cors from 'cors';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getMediaStatus,
  toggleStatus,
  getFavorites,
  removeStatus,
  getAllStatuses
} from '../controllers/userStatusController';

const router = express.Router();

// Configuration CORS spécifique à cette route
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Gérer explicitement les requêtes OPTIONS
router.options('*', cors(corsOptions));

// GET /api/user/status => tous les statuts de l'utilisateur
router.get('/', verifyToken, getAllStatuses);

// GET /api/user/status/:mediaType/:mediaId
router.get('/:mediaType/:mediaId', verifyToken, getMediaStatus);

// POST /api/user/status/toggle
router.post('/toggle', verifyToken, toggleStatus);

// GET /api/user/status/favorites
router.get('/favorites', verifyToken, getFavorites);

// DELETE /api/user/status/:status/:mediaType/:mediaId
router.delete('/:status/:mediaType/:mediaId', verifyToken, removeStatus);

export default router;
