import bcrypt from 'bcryptjs'; // Using bcryptjs instead of bcrypt for better browser compatibility
import { sign, verify } from 'jsonwebtoken';
import { User } from './prisma';

const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies if a plain password matches a hashed password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Creates a JWT token for a user
 */
export function createToken(user: Pick<User, 'id' | 'email'>): string {
  return sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}

/**
 * Verifies a JWT token and returns the payload
 */
export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const payload = verify(token, process.env.JWT_SECRET || 'fallback-secret');
    if (typeof payload === 'object' && payload !== null) {
      return {
        userId: Number(payload.userId),
        email: String(payload.email)
      };
    }
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Generates a verification token for a new user
 */
/**
 * Generates a verification token and its expiration date (24h from now)
 * @returns An object with the token and its expiration date
 */
export function generateVerificationToken(): { token: string, expiration: Date } {
  // Generate a random string of 64 characters for verification
  const token = Array(64)
    .fill(null)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
    
  // Set expiration to 24 hours from now
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  
  return { token, expiration };
}

/**
 * Validates if an email is in correct format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a password meets minimum security requirements
 * - At least 8 characters
 * - Contains at least one number
 * - Contains at least one uppercase letter
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  
  return hasNumber && hasUpperCase;
}
