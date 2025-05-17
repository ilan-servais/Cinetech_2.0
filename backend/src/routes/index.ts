import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
// ...import other routes

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
// ...other route uses

export default router;
