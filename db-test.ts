
import { prisma } from "./src/lib/prisma";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const result = await prisma.$queryRaw\`SELECT 1 as connected\`;
    console.log("Database connection successful:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then((success) => {
    console.log("Test completed");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

