/*
  Warnings:

  - The `totalStock` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "totalStock",
ADD COLUMN     "totalStock" INTEGER NOT NULL DEFAULT 0;
