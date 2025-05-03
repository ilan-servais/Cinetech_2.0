import bcrypt from 'bcrypt';
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
export function generateVerificationToken(): string {
  // Generate a random string of 64 characters for verification
  return Array(64)
    .fill(null)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}
