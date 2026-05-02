-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "isRegistrationOpen" BOOLEAN NOT NULL DEFAULT true;
