-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "classYear" INTEGER,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false;
