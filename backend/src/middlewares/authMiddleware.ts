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
    // Récupérer le token du cookie
    const token = req.cookies.auth_token;
    console.log('Token reçu :', req.cookies.auth_token); // Log temporaire pour vérifier le token
    
    if (!token) {
      return res.status(401).json({ message: "Accès non autorisé. Veuillez vous connecter." });
    }
    
    // Vérifier le token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé. Veuillez vous connecter à nouveau." });
    }
    
    // Attacher l'utilisateur à la requête pour une utilisation ultérieure
    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: "Token invalide ou expiré. Veuillez vous connecter à nouveau." });
  }
};
