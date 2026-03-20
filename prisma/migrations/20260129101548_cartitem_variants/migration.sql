/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,selectedColor,selectedSize]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "selectedColor" TEXT,
ADD COLUMN     "selectedSize" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_selectedColor_selectedSize_key" ON "CartItem"("cartId", "productId", "selectedColor", "selectedSize");
