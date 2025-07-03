import express from 'express';
import userRoutes from './userRoutes';
import testRoutes from './testRoutes';
import userStatusRoutes from './userStatusRoutes';

const router = express.Router();

// ❌ SUPPRIMÉ: router.use('/auth', authRoutes); 
// → Les routes auth sont gérées directement dans index.ts pour éviter la double protection JWT

router.use('/user', userRoutes);
router.use('/test', testRoutes);
router.use('/user/status', userStatusRoutes);

export default router;
