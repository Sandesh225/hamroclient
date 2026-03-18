/*
  Warnings:

  - The values [VISA_APPLIED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "AttestationStatus" AS ENUM ('NONE', 'MOFA', 'HEC', 'EMBASSY', 'UAE_MOFA', 'COMPLETE');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'FOLLOW_UP', 'WARNING', 'UPDATE', 'CALL', 'EMAIL');

-- CreateEnum
CREATE TYPE "FeePaidStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'DOCUMENTATION_GATHERING', 'VERIFICATION', 'MEDICAL_PENDING', 'VISA_SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED', 'DEPLOYED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "issuingCountry" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "weightKg" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "agencyFee" DECIMAL(10,2),
ADD COLUMN     "applicationDate" TIMESTAMP(3),
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "contractDurationMonths" INTEGER,
ADD COLUMN     "countrySpecificData" JSONB DEFAULT '{}',
ADD COLUMN     "deploymentDate" TIMESTAMP(3),
ADD COLUMN     "employerAbroad" TEXT,
ADD COLUMN     "expectedDeploymentDate" TIMESTAMP(3),
ADD COLUMN     "feePaidStatus" "FeePaidStatus",
ADD COLUMN     "jobPosition" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "salaryCurrency" TEXT,
ADD COLUMN     "salaryOffered" DECIMAL(12,2),
ADD COLUMN     "submissionDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "countrySpecific" TEXT,
ADD COLUMN     "isAttested" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MedicalClearance" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "examCenter" TEXT,
ADD COLUMN     "hepatitisResult" TEXT,
ADD COLUMN     "hivResult" TEXT,
ADD COLUMN     "tbResult" TEXT,
ADD COLUMN     "xrayResult" TEXT;

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "degreeTitle" TEXT,
    "institution" TEXT,
    "graduationYear" INTEGER,
    "certificateUrl" TEXT,
    "transcriptUrl" TEXT,
    "attestationStatus" "AttestationStatus" NOT NULL DEFAULT 'NONE',
    "attestedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "totalYearsExp" DECIMAL(4,1),
    "referenceLetterUrl" TEXT,
    "salaryProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "createdById" TEXT,
    "text" TEXT NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Education_applicantId_idx" ON "Education"("applicantId");

-- CreateIndex
CREATE INDEX "Employment_applicantId_idx" ON "Employment"("applicantId");

-- CreateIndex
CREATE INDEX "Note_applicantId_idx" ON "Note"("applicantId");

-- CreateIndex
CREATE INDEX "Note_createdById_idx" ON "Note"("createdById");

-- CreateIndex
CREATE INDEX "Applicant_nationality_idx" ON "Applicant"("nationality");

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
