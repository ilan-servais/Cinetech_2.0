import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getMediaStatus,
  toggleStatus,
  getFavorites,
  removeStatus,
  getAllStatuses,
  removeFavorite,
  removeWatched,
  removeWatchLater
} from '../controllers/userStatusController';

const router = express.Router();

// 🔍 DEBUG ENDPOINT - À SUPPRIMER EN PRODUCTION
router.get('/debug/:userId', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const userId = req.params.userId;
    console.log('🔍 DEBUG: Checking user status for userId:', userId);
    
    // Récupérer tous les statuts de cet utilisateur
    const allStatuses = await prisma.userStatus.findMany({
      where: { userId: userId }
    });
    
    console.log(`📊 Found ${allStatuses.length} statuses for user ${userId}`);
    
    const response = {
      userId: userId,
      totalStatuses: allStatuses.length,
      statuses: allStatuses.map((s: any) => ({
        id: s.id,
        mediaId: s.mediaId,
        mediaType: s.mediaType,
        status: s.status,
        title: s.title,
        createdAt: s.createdAt
      })),
      favoriteCount: allStatuses.filter((s: any) => s.status === 'FAVORITE').length,
      watchedCount: allStatuses.filter((s: any) => s.status === 'WATCHED').length,
      watchLaterCount: allStatuses.filter((s: any) => s.status === 'WATCH_LATER').length
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('💥 Debug endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Unknown error' });
  }
});

// 🔍 DEBUG ENDPOINT pour tester un status spécifique - À SUPPRIMER EN PRODUCTION
router.get('/debug/:userId/:mediaType/:mediaId', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const { userId, mediaType, mediaId } = req.params;
    const mediaIdNum = parseInt(mediaId);
    
    console.log('🔍 DEBUG Status Check:', { userId, mediaType, mediaId, mediaIdNum });
    
    const statuses = await prisma.userStatus.findMany({
      where: {
        userId: userId,
        mediaId: mediaIdNum,
        mediaType: mediaType
      }
    });
    
    const response = {
      userId,
      mediaType,
      mediaId: mediaIdNum,
      foundStatuses: statuses,
      result: {
        favorite: statuses.some((s: any) => s.status === 'FAVORITE'),
        watched: statuses.some((s: any) => s.status === 'WATCHED'),
        watchLater: statuses.some((s: any) => s.status === 'WATCH_LATER')
      }
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('💥 Debug status endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Unknown error' });
  }
});

// GET /api/user/status => retourne tous les statuts de l'utilisateur connecté
router.get('/', verifyToken, getAllStatuses);

// GET /api/user/status/:mediaType/:mediaId
// Note: Changed parameter name from :type to :mediaType to match controller expectations
router.get('/:mediaType/:mediaId', verifyToken, getMediaStatus);

// POST /api/user/status/toggle
router.post('/toggle', verifyToken, toggleStatus);

// GET /api/user/status/favorites
router.get('/favorites', verifyToken, getFavorites);

// DELETE /api/user/status/favorites/:mediaType/:mediaId
router.delete('/favorites/:mediaType/:mediaId', verifyToken, removeFavorite);
router.delete('/watched/:mediaType/:mediaId', verifyToken, removeWatched);
router.delete('/watchlater/:mediaType/:mediaId', verifyToken, removeWatchLater);

export default router;
