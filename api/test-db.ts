import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('Connexion à PostgreSQL réussie! Nombre d\'utilisateurs:', count);
  } catch(e) {
    console.error('Erreur de connexion:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
