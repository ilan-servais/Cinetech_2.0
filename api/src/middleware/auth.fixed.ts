import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Étend la requête Express pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
        is_verified?: boolean;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

/**
 * Middleware d'authentification
 * 
 * Vérifie si la requête contient un token JWT valide
 * Si oui, ajoute les informations de l'utilisateur à la requête
 * Sinon, retourne une erreur 401
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extraire le token d'authentification
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Format "Bearer <token>"
      token = authHeader.substring(7);
    } else {
      // Essayer de récupérer le token depuis les cookies
      token = req.cookies?.token || '';
    }

    // Si pas de token, retourner une erreur 401
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        is_verified: true
      }
    });

    // Si l'utilisateur n'existe pas, retourner une erreur 401
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      is_verified: user.is_verified
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est vérifié
 */
export const isVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Votre compte n\'est pas encore vérifié'
    });
  }

  next();
};
