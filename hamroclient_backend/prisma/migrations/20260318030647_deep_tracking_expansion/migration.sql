/*
  Warnings:

  - You are about to drop the column `address` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `hasPastRefusals` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `medicalStatus` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `passportDocUrl` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `passportExpiry` on the `Applicant` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Applicant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LanguageTestType" AS ENUM ('IELTS', 'PTE', 'TOEFL', 'JLPT', 'NAT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('IDENTITY', 'ACADEMIC', 'FINANCIAL', 'MEDICAL', 'VISA_SPECIFIC', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicalStatus" AS ENUM ('PENDING', 'FIT', 'UNFIT');

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "address",
DROP COLUMN "emergencyContact",
DROP COLUMN "firstName",
DROP COLUMN "hasPastRefusals",
DROP COLUMN "lastName",
DROP COLUMN "medicalStatus",
DROP COLUMN "passportDocUrl",
DROP COLUMN "passportExpiry",
ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "customFields" JSONB DEFAULT '{}',
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "fathersName" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "mothersName" TEXT,
ADD COLUMN     "nationalIdNumber" TEXT,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3),
ADD COLUMN     "passportIssueDate" TIMESTAMP(3),
ADD COLUMN     "pastVisaRefusals" JSONB,
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "placeOfIssue" TEXT,
ADD COLUMN     "previousTravelHistory" TEXT[];

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "biometricsDate" TIMESTAMP(3),
ADD COLUMN     "customFields" JSONB DEFAULT '{}',
ADD COLUMN     "dofeFinalStickerStatus" TEXT,
ADD COLUMN     "dofePreApprovalStatus" TEXT,
ADD COLUMN     "embassyAppointmentDate" TIMESTAMP(3),
ADD COLUMN     "targetCountry" TEXT;

-- CreateTable
CREATE TABLE "LanguageTest" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "testType" "LanguageTestType" NOT NULL,
    "testDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "overallScore" DOUBLE PRECISION,
    "readingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "listeningScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "registrationNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalClearance" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "MedicalStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "pccStatus" TEXT,
    "pccIssueDate" TIMESTAMP(3),
    "pccExpiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "applicationId" TEXT,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "s3Url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "customFields" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LanguageTest_applicantId_idx" ON "LanguageTest"("applicantId");

-- CreateIndex
CREATE INDEX "MedicalClearance_applicantId_idx" ON "MedicalClearance"("applicantId");

-- CreateIndex
CREATE INDEX "Document_applicantId_idx" ON "Document"("applicantId");

-- CreateIndex
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "Applicant_email_idx" ON "Applicant"("email");

-- CreateIndex
CREATE INDEX "Application_targetCountry_idx" ON "Application"("targetCountry");

-- AddForeignKey
ALTER TABLE "LanguageTest" ADD CONSTRAINT "LanguageTest_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalClearance" ADD CONSTRAINT "MedicalClearance_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
