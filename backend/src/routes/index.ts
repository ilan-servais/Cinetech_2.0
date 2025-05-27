import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import testRoutes from './testRoutes';
import userStatusRoutes from './userStatusRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/test', testRoutes);
router.use('/user/status', userStatusRoutes);

export default router;
