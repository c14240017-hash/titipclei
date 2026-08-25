ALTER TABLE "Product" ADD COLUMN "sellingPrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "popularity" INTEGER NOT NULL DEFAULT 0;
UPDATE "Product" SET "sellingPrice" = COALESCE("estimatedPriceIdr", 0) WHERE "sellingPrice" IS NULL;

ALTER TABLE "JastipRequest" ADD COLUMN "requestNumber" TEXT;
UPDATE "JastipRequest" SET "requestNumber" = 'REQ-CN-' || SUBSTRING("id" FROM 1 FOR 8) WHERE "requestNumber" IS NULL;
ALTER TABLE "JastipRequest" ALTER COLUMN "requestNumber" SET NOT NULL;
CREATE UNIQUE INDEX "JastipRequest_requestNumber_key" ON "JastipRequest"("requestNumber");
ALTER TABLE "JastipRequest" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Quotation" ADD COLUMN "publicToken" TEXT;
UPDATE "Quotation" SET "publicToken" = 'qt-' || "id" WHERE "publicToken" IS NULL;
ALTER TABLE "Quotation" ALTER COLUMN "publicToken" SET NOT NULL;
CREATE UNIQUE INDEX "Quotation_publicToken_key" ON "Quotation"("publicToken");
ALTER TABLE "Quotation" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Order" ADD COLUMN "publicToken" TEXT;
UPDATE "Order" SET "publicToken" = 'ord-' || "id" WHERE "publicToken" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "publicToken" SET NOT NULL;
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
