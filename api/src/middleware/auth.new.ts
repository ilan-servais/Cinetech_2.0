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
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string): { id: number; email: string } | undefined => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch (error) {
    return undefined;
  }
};

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
    // Récupérer le token depuis les cookies ou le header Authorization
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
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
      where: { id: decoded.id }
    });

    // Si l'utilisateur n'existe pas, retourner une erreur 401
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter l'utilisateur à la requête en utilisant any pour éviter les erreurs TypeScript
    // Les champs existent bien dans le schéma Prisma
    req.user = {
      id: user.id,
      email: user.email,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      is_verified: (user as any).is_verified
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est vérifié
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Votre compte n\'est pas vérifié. Veuillez vérifier votre email.'
    });
  }

  next();
};
