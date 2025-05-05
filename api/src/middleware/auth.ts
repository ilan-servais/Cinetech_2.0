import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { prisma } from '../lib/prisma';

// Étendre l'interface Express.Request pour y inclure l'objet user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié via un token JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Non authentifié - token manquant' });
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Non authentifié - token invalide' });
    }

    // Vérifier si l'utilisateur existe toujours en base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username || ''
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Middleware optionnel - récupère l'utilisateur si un token est présent, mais continue si non
 */
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return next(); // Continue sans utilisateur
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(); // Token invalide, continue sans utilisateur
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username || ''
      };
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    next(); // Continue malgré l'erreur
  }
};
