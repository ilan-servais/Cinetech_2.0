import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import testRoutes from './testRoutes';
import userStatusRoutes from './userStatusRoutes';

const router = express.Router();

// Monter les routes sans ajouter de middleware supplémentaire entre les deux
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/test', testRoutes);
router.use('/user/status', userStatusRoutes);

export default router;
