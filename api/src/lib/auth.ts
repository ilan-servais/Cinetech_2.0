import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// Récupérer la clé JWT du fichier .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Interface pour les données utilisateur dans le token
export interface TokenPayload {
  id: number;
  email: string;
  is_verified?: boolean;
}

/**
 * Hache un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Vérifie si un mot de passe correspond au hash stocké
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateToken(user: TokenPayload): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      is_verified: user.is_verified
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Vérifie un token JWT et retourne les données utilisateur
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Fonction generateUsername supprimée car username n'est plus utilisé dans le modèle
