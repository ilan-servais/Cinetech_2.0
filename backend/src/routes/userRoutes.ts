import express from 'express';
import cors from 'cors';
import { getWatchedItems, getWatchLaterItems, getFavorites } from '../controllers/userStatusController';
import { getCurrentUser, updateAvatarController } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';
import { uploadAvatar } from '../middlewares/avatarMulter';

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

// Routes sécurisées avec token
router.get('/favorites', verifyToken, getFavorites);
router.get('/watched', verifyToken, getWatchedItems);
router.get('/watchlater', verifyToken, getWatchLaterItems);
router.get('/me', verifyToken, getCurrentUser);
router.post('/upload-avatar', verifyToken, uploadAvatar.single('avatar'), updateAvatarController);

export default router;
