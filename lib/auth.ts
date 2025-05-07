import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

// Hash a password with bcrypt (10 rounds)
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Compare a password with a hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Generate a verification token
export function generateVerificationToken(): string {
  return randomUUID();
}

// Generate token expiration date (24 hours from now)
export function generateTokenExpiration(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
}

// Check if a token is expired
export function isTokenExpired(expirationDate: Date | undefined): boolean {
  if (!expirationDate) return true;
  return new Date() > new Date(expirationDate);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}
