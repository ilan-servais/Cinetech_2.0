// This file sets up the test environment

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch globally
global.fetch = jest.fn();

// Optional: Clear all mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';

// Mock les imports CSS pour éviter les erreurs Jest
jest.mock('./app/globals.css', () => ({}));

// Mock Next.js cookies API
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock JWT functions
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: '1', email: 'test@example.com' }),
}));

// Ajouter d'autres mocks si nécessaire
