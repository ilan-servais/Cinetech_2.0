import { registerHandler } from '@/lib/api-handlers';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock Auth functions
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  generateVerificationToken: jest.fn().mockReturnValue({ token: 'verification-token-123', expiration: new Date() }),
}));

// Mock Email function
jest.mock('@/lib/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({}),
}));

describe('Register API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    // Missing email
    let result = await registerHandler({ username: 'testuser', password: 'password123' });
    expect(result.status).toBe(400);
    
    // Missing username
    result = await registerHandler({ email: 'test@example.com', password: 'password123' });
    expect(result.status).toBe(400);
    
    // Missing password
    result = await registerHandler({ email: 'test@example.com', username: 'testuser' });
    expect(result.status).toBe(400);
  });

  it('should return 409 if user already exists', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'existing@example.com',
      username: 'existinguser',
    });

    const result = await registerHandler({
      email: 'existing@example.com',
      username: 'existinguser',
      password: 'password123',
    });

    expect(result.status).toBe(409);
    expect(result.body).toHaveProperty(
      'error',
      'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà'
    );
  });

  it('should create a new user and return 201 if registration is successful', async () => {
    // User doesn't exist
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    
    // Mock successful user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'new@example.com',
      username: 'newuser',
      is_verified: false,
    });

    const result = await registerHandler({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });

    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(generateVerificationToken).toHaveBeenCalled();
    
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new@example.com',
        username: 'newuser',
        hashed_password: 'hashed-password',
        is_verified: false,
        verification_token: 'verification-token-123',
      }),
    });
    
    expect(sendVerificationEmail).toHaveBeenCalledWith('new@example.com', 'verification-token-123');
    
    expect(result.status).toBe(201);
    expect(result.body).toHaveProperty(
      'message',
      'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.'
    );
    expect(result.body).toHaveProperty('userId', 1);
  });

  it('should handle email sending errors gracefully', async () => {
    // User doesn't exist
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    
    // Mock successful user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'new@example.com',
      username: 'newuser',
      is_verified: false,
    });
    
    // Mock email error
    (sendVerificationEmail as jest.Mock).mockRejectedValue(new Error('Email sending failed'));

    const result = await registerHandler({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });

    // Should still return success even if email fails
    expect(result.status).toBe(201);
  });

  it('should return 500 if there is a server error', async () => {
    // Mock a database error
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await registerHandler({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });

    expect(result.status).toBe(500);
    expect(result.body).toHaveProperty(
      'error',
      'Une erreur s\'est produite lors de l\'inscription'
    );
  });
});
