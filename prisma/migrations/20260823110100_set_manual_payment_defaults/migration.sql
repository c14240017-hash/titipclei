-- Kept in a separate migration because PostgreSQL cannot use a newly added enum value
-- as a default until the enum alteration has committed.
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'WAITING_PAYMENT';
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'WAITING_PAYMENT';
