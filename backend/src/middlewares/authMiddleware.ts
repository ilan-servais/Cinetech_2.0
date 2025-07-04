import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🔍 DEBUG complet des headers et cookies
    console.log('🔐 [AuthMiddleware] Headers reçus:', {
      'origin': req.headers.origin,
      'referer': req.headers.referer,
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
      'cookie': req.headers.cookie ? req.headers.cookie.substring(0, 100) + '...' : 'AUCUN',
      'credentials': req.headers.credentials || 'N/A'
    });
    
    console.log('🍪 [AuthMiddleware] Cookies parsés:', req.cookies);
    
    // Récupérer le token du cookie
    const token = req.cookies.auth_token;
    console.log('🎫 [AuthMiddleware] Token reçu:', token ? `${token.substring(0, 20)}...` : 'AUCUN');
    
    if (!token) {
      console.log('❌ [AuthMiddleware] Aucun token trouvé dans les cookies');
      return res.status(401).json({ 
        message: "Accès non autorisé. Veuillez vous connecter.",
        debug: {
          cookiesReceived: Object.keys(req.cookies),
          hasAuthToken: false,
          origin: req.headers.origin
        }
      });
    }
    
    // Vérifier le token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    console.log('✅ [AuthMiddleware] Token valide pour userId:', decoded.userId);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      console.log('❌ [AuthMiddleware] Utilisateur non trouvé:', decoded.userId);
      return res.status(401).json({ message: "Utilisateur non trouvé. Veuillez vous connecter à nouveau." });
    }
    
    console.log('✅ [AuthMiddleware] Utilisateur authentifié:', user.email);
    
    // Attacher l'utilisateur à la requête pour une utilisation ultérieure
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AuthMiddleware] Error verifying token:', error);
    return res.status(401).json({ 
      message: "Token invalide ou expiré. Veuillez vous connecter à nouveau.",
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        hasToken: !!req.cookies.auth_token,
        origin: req.headers.origin
      }
    });
  }
};
