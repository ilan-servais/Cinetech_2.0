import express from 'express';
import authRoutes from './authRoutes';
import userStatusRoutes from './userStatusRoutes';
import userRoutes from './userRoutes';
import testRoutes from './testRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
// Monter /user/status AVANT /user pour que les OPTIONS ne passent pas dans userRoutes
router.use('/user/status', userStatusRoutes);
router.use('/user', userRoutes);
router.use('/test', testRoutes);

export default router;
