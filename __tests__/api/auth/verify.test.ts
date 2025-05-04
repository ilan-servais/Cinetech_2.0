import { verifyHandler } from '@/lib/api-handlers';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Email Verification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if token is missing', async () => {
    const result = await verifyHandler({});
    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty('error', 'Token required');
  });

  it('should return 400 if token is invalid', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await verifyHandler({ token: 'invalid-token' });
    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty('error', 'Token invalide ou expiré');
  });

  it('should return 400 if token is expired', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // One day in the past
    
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      is_verified: false,
      token_expiration: pastDate,
    });

    const result = await verifyHandler({ token: 'expired-token' });
    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty('error', 'Token expiré. Veuillez demander un nouveau lien de vérification.');
  });

  it('should verify user and return 200 if token is valid', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // One day in the future
    
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      is_verified: false,
      token_expiration: futureDate,
    });
    
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      is_verified: true,
    });

    const result = await verifyHandler({ token: 'valid-token' });
    
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        is_verified: true,
        verification_token: null,
        token_expiration: null,
      },
    });
    
    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('message', 'Email vérifié avec succès');
  });

  it('should return 500 if there is a server error', async () => {
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await verifyHandler({ token: 'valid-token' });
    expect(result.status).toBe(500);
    expect(result.body).toHaveProperty('error', 'Une erreur s\'est produite lors de la vérification');
  });
});
