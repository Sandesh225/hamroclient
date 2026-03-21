import 'dotenv/config';
import { ApplicationStatus, Role } from '@prisma/client';
import prisma from '../lib/prisma';
import fs from 'fs';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Starting full database seed...");

  console.log("Truncating all tables...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Note", "Document", "MedicalClearance", "LanguageTest", "Employment", "Education", "Application", "Applicant", "DestinationSponsor", "Agent", "User", "Branch", "Company" CASCADE;`);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 0. Create System Admin (Global platform owner)
  const systemAdmin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@hamroclient.com",
      passwordHash,
      role: "SYSTEM_ADMIN" as any,
      isProfileComplete: true,
    } as any
  });
  console.log(`Created System Admin: ${systemAdmin.email}`);

  // 1. Create Default Company
  const company = await (prisma as any).company.create({
    data: {
      businessName: "Hamro Manpower Solutions",
      registrationNumber: "HMS-1001",
      contactEmail: "info@hamromanpower.com",
      address: "Kathmandu, Nepal",
    }
  });
  console.log(`Created Company: ${company.businessName}`);

  // 2. Create Branches for requested cities
  const cities = [
    "Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", 
    "Birgunj", "Butwal", "Bharatpur", "Janakpur", "Dharan", 
    "Hetauda", "Nepalgunj", "Chitwan", "Itahari", "Dhangadhi", 
    "Mahendranagar", "Tulsipur", "Ghorahi", "Kalaiya", "Rajbiraj", 
    "Lahan", "Banepa"
  ];

  await Promise.all(
    cities.map(city => 
      prisma.branch.create({
        data: {
          name: `${city} Branch`,
          location: city,
          companyId: company.id
        } as any
      })
    )
  );
  console.log(`Successfully created ${cities.length} branches across Nepal!`);

  // 3. Create a Company Admin
  await prisma.user.create({
    data: {
      name: "Company Admin",
      email: "admin@hamromanpower.com",
      passwordHash,
      role: "COMPANY_ADMIN" as any,
      companyId: company.id,
      isProfileComplete: true,
    } as any
  });
  console.log("Created Company Admin: admin@hamromanpower.com");
  
  console.log("Seed complete. System Admin, Company, Company Admin, and all 22 city branches are ready.");
}

main()
  .catch((e) => {
    fs.writeFileSync('prisma_seed_error.json', JSON.stringify({ message: e.message, stack: e.stack }, null, 2));
    console.error("Error logged to prisma_seed_error.json");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
