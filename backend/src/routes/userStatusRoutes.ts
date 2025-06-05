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

// Configuration CORS spécifique à ce router
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

// Appliquer CORS à toutes les routes de ce router
router.use(cors(corsOptions));
// Gérer explicitement les requêtes OPTIONS
router.options('*', cors(corsOptions));

// Routes protégées par verifyToken
router.get('/', verifyToken, getAllStatuses);
router.get('/:mediaType/:mediaId', verifyToken, getMediaStatus);
router.post('/toggle', verifyToken, toggleStatus);
router.get('/favorites', verifyToken, getFavorites);
router.delete('/:status/:mediaType/:mediaId', verifyToken, removeStatus);

export default router;
