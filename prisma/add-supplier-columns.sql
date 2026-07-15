-- Semi-automatic CJ fulfilment: track the draft order created in CJ.
-- Additive and idempotent — safe to run more than once, no data loss.
-- Run in the Neon SQL Editor (console.neon.tech) BEFORE deploying.

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supplierOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supplierStatus" TEXT;
