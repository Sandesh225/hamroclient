import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log("Testing Prisma...");
prisma.user.findMany().then(users => {
  console.log("Users found:", users.length);
}).catch(console.error).finally(() => prisma.$disconnect());
