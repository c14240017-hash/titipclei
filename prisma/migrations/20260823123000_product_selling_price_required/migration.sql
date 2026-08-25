ALTER TABLE "Product" ALTER COLUMN "sellingPrice" SET DEFAULT 0;
UPDATE "Product" SET "sellingPrice" = COALESCE("sellingPrice", "estimatedPriceIdr", 0);
ALTER TABLE "Product" ALTER COLUMN "sellingPrice" SET NOT NULL;
