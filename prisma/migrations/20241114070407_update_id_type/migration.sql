/*
  Warnings:

  - The primary key for the `Article` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Article` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `authorId` column on the `Article` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ArticleComment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ArticleComment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `ArticleComment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProductComment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProductComment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `authorId` column on the `ProductComment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserPreference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `articleId` on the `ArticleComment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `ProductComment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UserPreference` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_ProductToUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_ProductToUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleComment" DROP CONSTRAINT "ArticleComment_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleComment" DROP CONSTRAINT "ArticleComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComment" DROP CONSTRAINT "ProductComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComment" DROP CONSTRAINT "ProductComment_productId_fkey";

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToUser" DROP CONSTRAINT "_ProductToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToUser" DROP CONSTRAINT "_ProductToUser_B_fkey";

-- AlterTable
ALTER TABLE "Article" DROP CONSTRAINT "Article_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER,
ADD CONSTRAINT "Article_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ArticleComment" DROP CONSTRAINT "ArticleComment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER,
DROP COLUMN "articleId",
ADD COLUMN     "articleId" INTEGER NOT NULL,
ADD CONSTRAINT "ArticleComment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductComment" DROP CONSTRAINT "ProductComment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER,
ADD CONSTRAINT "ProductComment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_ProductToUser" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToUser_AB_unique" ON "_ProductToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToUser_B_index" ON "_ProductToUser"("B");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComment" ADD CONSTRAINT "ProductComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComment" ADD CONSTRAINT "ProductComment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToUser" ADD CONSTRAINT "_ProductToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToUser" ADD CONSTRAINT "_ProductToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
