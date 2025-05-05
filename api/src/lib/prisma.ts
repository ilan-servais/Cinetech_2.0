import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au scope global afin d'éviter trop de connexions en développement
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
