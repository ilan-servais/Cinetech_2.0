const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserStatus() {
  console.log('🔍 Starting debug for user status...');
  
  const userId = 'aaa920c4-176c-4237-9e72-4a9b935c1ea8';
  
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    console.log('👤 User found:', user ? { id: user.id, email: user.email } : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    // 2. Récupérer tous les statuts de cet utilisateur
    const allStatuses = await prisma.userStatus.findMany({
      where: { userId: userId }
    });
    
    console.log(`📊 Total statuses for user: ${allStatuses.length}`);
    allStatuses.forEach((status, index) => {
      console.log(`  ${index + 1}. Media ${status.mediaId} (${status.mediaType}): ${status.status} - "${status.title}"`);
    });
    
    // 3. Tester un media spécifique
    if (allStatuses.length > 0) {
      const testMedia = allStatuses[0];
      console.log(`\n🎯 Testing specific media: ${testMedia.mediaId} (${testMedia.mediaType})`);
      
      const specificStatuses = await prisma.userStatus.findMany({
        where: {
          userId: userId,
          mediaId: testMedia.mediaId,
          mediaType: testMedia.mediaType
        }
      });
      
      console.log('🔍 Specific query result:', specificStatuses);
      
      // Test avec conversion de types
      console.log('\n🔄 Testing with type conversions:');
      console.log('  - mediaId as string:', typeof testMedia.mediaId.toString());
      console.log('  - mediaId as number:', typeof testMedia.mediaId);
      
      // Test de la requête avec différents types
      const testWithStringId = await prisma.userStatus.findMany({
        where: {
          userId: userId,
          mediaId: parseInt(testMedia.mediaId.toString()),
          mediaType: testMedia.mediaType
        }
      });
      
      console.log('🔍 Query with parseInt result:', testWithStringId.length);
    }
    
    // 4. Tester les favoris spécifiquement
    const favorites = await prisma.userStatus.findMany({
      where: {
        userId: userId,
        status: 'FAVORITE'
      }
    });
    
    console.log(`\n❤️ Favorites count: ${favorites.length}`);
    favorites.forEach((fav, index) => {
      console.log(`  ${index + 1}. ${fav.mediaId} (${fav.mediaType}): "${fav.title}"`);
    });
    
  } catch (error) {
    console.error('💥 Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserStatus();
