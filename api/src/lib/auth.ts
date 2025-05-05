import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// Récupérer la clé JWT du fichier .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Interface pour les données utilisateur dans le token
export interface TokenPayload {
  id: string;
  email: string;
  username: string;
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
      username: user.username
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

/**
 * Génère un nom d'utilisateur basé sur prénom/nom avec un nombre aléatoire
 */
export async function generateUsername(firstName: string, lastName: string): Promise<string> {
  // Nettoyer et normaliser prénom et nom
  const cleanFirstName = firstName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLastName = lastName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Construire le nom de base
  const baseUsername = `${cleanFirstName}${cleanLastName}`;
  
  // Générer un nombre à 4 chiffres aléatoire
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  // Vérifier si ce nom est déjà pris
  const username = `${baseUsername}#${randomSuffix}`;
  
  // Vérifier la disponibilité
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });
  
  // Si le nom est déjà pris, on en génère un autre récursivement
  if (existingUser) {
    return generateUsername(firstName, lastName);
  }
  
  return username;
}
