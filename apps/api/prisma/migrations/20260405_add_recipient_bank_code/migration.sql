ALTER TABLE "Recipient"
ADD COLUMN "bankCode" TEXT;

UPDATE "Recipient"
SET "bankCode" = CASE "bankName"
  WHEN 'GTBank' THEN '058'
  WHEN 'Access Bank' THEN '044'
  ELSE NULL
END
WHERE "bankCode" IS NULL;
