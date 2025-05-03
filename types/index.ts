import { User as PrismaUser } from '@prisma/client';

// Extend Prisma User type to ensure all fields are properly typed
export interface User extends PrismaUser {
  is_verified: boolean;
  hashed_password: string;
  verification_token?: string | null;
  token_expiration?: Date | null;
}

// Safe user type for client-side (without sensitive data)
export type SafeUser = Omit<User, 'password' | 'hashed_password' | 'verification_token' | 'token_expiration'>;

// Auth response type
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string | null;
    avatar: string | null;
  };
}
