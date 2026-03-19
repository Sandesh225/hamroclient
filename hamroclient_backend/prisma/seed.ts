import 'dotenv/config';
import { ApplicationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import fs from 'fs';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Starting full database seed...");

  console.log("Truncating all tables...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Note", "Document", "MedicalClearance", "LanguageTest", "Employment", "Education", "Application", "Applicant", "DestinationSponsor", "Agent", "User", "Branch" CASCADE;`);

  // 2. Create Single Branch
  const mainBranch = await prisma.branch.create({
    data: {
      name: "Kathmandu Headquarters",
      location: "Bagbazar, Kathmandu",
    }
  });
  console.log(`Created Branch: ${mainBranch.name}`);

  // 3. Create Users (1 Admin, 3 Staff)
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@agency.com",
        passwordHash,
        role: "ADMIN",
        branchId: mainBranch.id,
      }
    }),
    prisma.user.create({
      data: {
        name: "Sita Sharma",
        email: "sita.staff@agency.com",
        passwordHash,
        role: "STAFF",
        branchId: mainBranch.id,
      }
    }),
    prisma.user.create({
      data: {
        name: "Rajesh Pokharel",
        email: "rajesh.staff@agency.com",
        passwordHash,
        role: "STAFF",
        branchId: mainBranch.id,
      }
    }),
    prisma.user.create({
      data: {
        name: "Anita Gurung",
        email: "anita.staff@agency.com",
        passwordHash,
        role: "STAFF",
        branchId: mainBranch.id,
      }
    })
  ]);
  console.log(`Created 1 Admin and 3 Staff members.`);

  // 4. Create Agents
  const agentIdList = await Promise.all([
    prisma.agent.create({ data: { name: "Direct Client", type: "DIRECT" } }),
    prisma.agent.create({ data: { name: "Global HR Solutions", type: "INDIRECT", email: "info@globalhr.com", phone: "+977-9801122334" } })
  ]);
  const agent1Id = agentIdList[0].id;
  const agent2Id = agentIdList[1].id;

  // 5. Seed Robust Applicants spanning statuses
  const applicantsData = [
    { name: "Ram Bahadur Tamang", type: "WORKER", passport: "NP12345678", dest: "JAPAN", visa: "SSW", job: "Food Manufacturing", status: "VISA_SUBMITTED", staff: users[1].id, agent: agent1Id, medical: "PENDING" },
    { name: "Hari Prasad Oli", type: "WORKER", passport: "NP23456789", dest: "UAE", visa: "Work Visa", job: "Electrician", status: "MEDICAL_PENDING", staff: users[2].id, agent: agent2Id, medical: "PENDING" },
    { name: "Gita Adhikari", type: "WORKER", passport: "NP34567890", dest: "AUSTRALIA", visa: "TSS 482", job: "Aged Care Worker", status: "APPROVED", staff: users[3].id, agent: agent1Id, medical: "FIT" },
    { name: "Bikash Khadka", type: "WORKER", passport: "NP45678901", dest: "UAE", visa: "Work Visa", job: "AC Technician", status: "PENDING", staff: users[1].id, agent: agent2Id, medical: "PENDING" },
    { name: "Krishna Maharjan", type: "WORKER", passport: "NP56789012", dest: "QATAR", visa: "Work Permit", job: "Heavy Driver", status: "MEDICAL_PENDING", staff: users[2].id, agent: agent1Id, medical: "PENDING" },
    { name: "Puja Gurung", type: "WORKER", passport: "NP67890123", dest: "JAPAN", visa: "SSW", job: "Care Worker", status: "VISA_SUBMITTED", staff: users[3].id, agent: agent1Id, medical: "FIT" },
    { name: "Sunil Thapa", type: "STUDENT", passport: "NP78901234", dest: "AUSTRALIA", visa: "Student 500", job: null, status: "PROCESSING", staff: users[1].id, agent: agent2Id, medical: "FIT" },
    { name: "Deepak B.K.", type: "WORKER", passport: "NP89012345", dest: "JAPAN", visa: "Technical Intern", job: "Factory Worker", status: "REJECTED", staff: users[2].id, agent: agent1Id, medical: "FIT" },
    { name: "Sunita Rai", type: "WORKER", passport: "NP90123456", dest: "QATAR", visa: "Work Permit", job: "Housemaid", status: "DEPLOYED", staff: users[3].id, agent: agent1Id, medical: "FIT" },
    { name: "Anuja Pandey", type: "STUDENT", passport: "NP01234567", dest: "USA", visa: "F-1", job: null, status: "DOCUMENTATION_GATHERING", staff: users[1].id, agent: agent2Id, medical: "PENDING" },
  ];

  for (const a of applicantsData) {
    // Determine timestamps based on status to ensure recent activity and metrics are non-zero.
    const today = new Date();
    const isOld = a.status === "DEPLOYED" || a.status === "REJECTED";
    let createdAt = new Date(today);
    createdAt.setDate(today.getDate() - (isOld ? 40 : 5));
    let updatedAt = new Date(today);
    updatedAt.setDate(today.getDate() - Math.floor(Math.random() * 4));

    const applicant = await prisma.applicant.create({
      data: {
        fullName: a.name,
        type: a.type as any,
        passportNumber: a.passport,
        phone: "+977" + Math.floor(9000000000 + Math.random() * 999999999),
        email: a.name.split(" ")[0].toLowerCase() + "@example.com",
        city: "Kathmandu",
        dateOfBirth: new Date("1995-01-01"),
        createdAt,
        updatedAt,
      }
    });

    const application = await prisma.application.create({
      data: {
        applicantId: applicant.id,
        branchId: mainBranch.id,
        status: a.status as ApplicationStatus,
        destinationCountry: a.dest,
        visaType: a.visa,
        jobPosition: a.job,
        userId: a.staff,
        agentId: a.agent,
        createdAt,
        updatedAt,
      }
    });

    await prisma.medicalClearance.create({
      data: {
        applicantId: applicant.id,
        status: a.medical as any,
        examCenter: a.medical === "FIT" ? "Global Medical Center" : null,
        expiryDate: a.medical === "FIT" ? new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
      }
    });

    await prisma.document.createMany({
      data: [
        { applicantId: applicant.id, applicationId: application.id, title: "Passport Copy", category: "IDENTITY", s3Url: "#", isVerified: true },
        { applicantId: applicant.id, applicationId: application.id, title: "Citizenship", category: "IDENTITY", s3Url: "#", isVerified: false }
      ]
    });

    await prisma.note.createMany({
      data: [
        { applicantId: applicant.id, text: `Initial application taken for ${a.dest}.`, type: "GENERAL", createdById: a.staff, createdAt },
        { applicantId: applicant.id, text: `Status updated to ${a.status}`, type: "UPDATE", createdById: a.staff, createdAt: updatedAt }
      ]
    });
  }

  console.log("Seeded 10 complex applicants with linked records. Seed complete.");
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
