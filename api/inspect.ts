import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Inspecting User schema...');
    
    // Check if the User table exists and has any records
    const userCount = await prisma.user.count();
    console.log(`User table has ${userCount} records`);
    
    // Get the first user to inspect its structure
    const user = await prisma.user.findFirst();
    
    if (user) {
      console.log('User record structure:');
      console.log(Object.keys(user));
      console.log('User record full data:');
      console.log(user);
    } else {
      console.log('No user records found. Creating a test user...');
      
      // Create a test user to see the structure
      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser#1234',
          password: 'password123',
          isVerified: false
        }
      });
      
      console.log('Test user created with structure:');
      console.log(Object.keys(newUser));
      console.log('Test user full data:');
      console.log(newUser);
    }
    
  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
