-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('STANDARD', 'VIP', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'STANDARD';
