/*
  Warnings:

  - You are about to drop the column `employerId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `Employer` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicantType" ADD VALUE 'VISITOR';
ALTER TYPE "ApplicantType" ADD VALUE 'BUSINESS';
ALTER TYPE "ApplicantType" ADD VALUE 'DEPENDENT';
ALTER TYPE "ApplicantType" ADD VALUE 'OTHER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'DOCUMENTATION_GATHERING';
ALTER TYPE "ApplicationStatus" ADD VALUE 'MEDICAL_PENDING';
ALTER TYPE "ApplicationStatus" ADD VALUE 'COMPLETED';

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_employerId_fkey";

-- DropIndex
DROP INDEX "Application_employerId_idx";

-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hasPastRefusals" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "passportExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "employerId",
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "sponsorId" TEXT,
ADD COLUMN     "visaCategory" TEXT;

-- DropTable
DROP TABLE "Employer";

-- CreateTable
CREATE TABLE "DestinationSponsor" (
    "id" TEXT NOT NULL,
    "sponsorName" TEXT NOT NULL,
    "sponsorType" TEXT,
    "destinationCountry" TEXT NOT NULL,
    "industryOrFaculty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DestinationSponsor_destinationCountry_idx" ON "DestinationSponsor"("destinationCountry");

-- CreateIndex
CREATE INDEX "Application_sponsorId_idx" ON "Application"("sponsorId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "DestinationSponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
