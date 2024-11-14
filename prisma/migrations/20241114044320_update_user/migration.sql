/*
  Warnings:

  - You are about to drop the column `userId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ProductComment` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComment" DROP CONSTRAINT "ProductComment_userId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "ProductComment" DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
ALTER COLUMN "password" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComment" ADD CONSTRAINT "ProductComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
