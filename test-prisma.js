const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test database connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', result);
    
    // Get user count
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
    
    return { success: true, message: 'Database connection works!' };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(result => console.log(result))
  .catch(e => console.error(e));
