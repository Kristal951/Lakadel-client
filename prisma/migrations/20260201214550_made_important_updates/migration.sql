/*
  Warnings:

  - A unique constraint covering the columns `[guestID]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "selectedColor" TEXT,
ADD COLUMN     "selectedSize" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_guestID_key" ON "User"("guestID");

-- CreateIndex
CREATE INDEX "User_guestID_idx" ON "User"("guestID");
