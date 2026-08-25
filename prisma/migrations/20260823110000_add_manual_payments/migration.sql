-- Extend the existing order lifecycle for manual bank-transfer verification.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'WAITING_VERIFICATION';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CHECKING_ITEM';

ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'WAITING_PAYMENT';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'WAITING_VERIFICATION';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'VERIFIED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER');

ALTER TABLE "JastipRequest" ALTER COLUMN "productUrl" DROP NOT NULL;

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "bankName" TEXT NOT NULL,
    "destinationAccount" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "proofImageUrl" TEXT,
    "senderName" TEXT,
    "notes" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
