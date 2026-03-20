-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingFee" TEXT;
