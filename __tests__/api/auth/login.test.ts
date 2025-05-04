import { loginHandler } from '@/lib/api-handlers';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Auth
jest.mock('@/lib/auth', () => ({
  verifyPassword: jest.fn(),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-token'),
}));

describe('Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email is missing', async () => {
    const result = await loginHandler({ password: 'password123' });
    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty('error', 'Email et mot de passe requis');
  });

  it('should return 400 if password is missing', async () => {
    const result = await loginHandler({ email: 'test@example.com' });
    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty('error', 'Email et mot de passe requis');
  });

  it('should return 401 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await loginHandler({ email: 'nonexistent@example.com', password: 'password123' });
    expect(result.status).toBe(401);
    expect(result.body).toHaveProperty('error', 'Identifiants invalides.');
  });

  it('should return 403 if user is not verified', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      hashed_password: 'hashedpassword',
      is_verified: false,
    });

    const result = await loginHandler({ email: 'test@example.com', password: 'password123' });
    expect(result.status).toBe(403);
    expect(result.body).toHaveProperty('error', 'Veuillez vérifier votre adresse email avant de vous connecter.');
  });

  it('should return 401 if password is invalid', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      hashed_password: 'hashedpassword',
      is_verified: true,
    });
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    const result = await loginHandler({ email: 'test@example.com', password: 'wrongpassword' });
    expect(result.status).toBe(401);
    expect(result.body).toHaveProperty('error', 'Identifiants invalides.');
  });

  it('should return 200 with token and user info if login is successful', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      hashed_password: 'hashedpassword',
      avatar: 'avatar.jpg',
      is_verified: true,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const result = await loginHandler({ email: 'test@example.com', password: 'password123' });
    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('token', 'mocked-token');
    expect(result.body).toHaveProperty('user', {
      email: 'test@example.com',
      username: 'testuser',
      avatar: 'avatar.jpg',
    });
    expect(sign).toHaveBeenCalledWith(
      { userId: 1, email: 'test@example.com' },
      expect.any(String),
      { expiresIn: '7d' }
    );
  });
});
