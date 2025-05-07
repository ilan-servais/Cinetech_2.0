import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au scope global afin d'éviter trop de connexions en développement
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Vérifiez la DATABASE_URL avant d'initialiser Prisma
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not defined! Prisma might not work properly.');
  console.warn('Current DATABASE_URL:', process.env.DATABASE_URL);
}

// Initialiser avec des options de journalisation pour le débogage
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
