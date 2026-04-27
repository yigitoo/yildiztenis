-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'UNVERIFIED';

-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'APPLICATION_VERIFICATION';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "verificationCodeHash" TEXT,
ADD COLUMN     "verificationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'UNVERIFIED';
