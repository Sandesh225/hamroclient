import prisma from './hamroclient_backend/lib/prisma';
import bcrypt from 'bcryptjs';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        companyId: true,
      }
    });
    console.log("Existing Users:", JSON.stringify(users, null, 2));

    const systemAdminExists = users.some(u => u.role === 'SYSTEM_ADMIN');
    if (!systemAdminExists) {
      console.log("SYSTEM_ADMIN missing! Creating one...");
      const passwordHash = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          name: "System Administrator",
          email: "admin@hamroclient.com",
          passwordHash,
          role: "SYSTEM_ADMIN",
          isProfileComplete: true,
        }
      });
      console.log("SYSTEM_ADMIN (admin@hamroclient.com) created with password 'password123'");
    } else {
      console.log("SYSTEM_ADMIN already exists.");
    }

  } catch (error) {
    console.error("Diagnostic Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
