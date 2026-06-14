import { prisma } from "@/lib/db";

export interface DiscountResult {
  valid: boolean;
  message: string;
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
  discountAmount?: number; // computed amount in dollars for the given subtotal
}

/**
 * Validate a discount code against a cart subtotal.
 * Returns the computed discount amount (never exceeding the subtotal).
 */
export async function evaluateDiscount(
  rawCode: string,
  subtotal: number
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, message: "Enter a code." };

  const dc = await prisma.discountCode.findUnique({ where: { code } });
  if (!dc || !dc.active) {
    return { valid: false, message: "Invalid or expired code." };
  }
  if (dc.expiresAt && dc.expiresAt.getTime() < Date.now()) {
    return { valid: false, message: "This code has expired." };
  }
  if (dc.maxUses != null && dc.usedCount >= dc.maxUses) {
    return { valid: false, message: "This code has reached its usage limit." };
  }
  if (subtotal < dc.minSubtotal) {
    return {
      valid: false,
      message: `Requires a minimum order of $${dc.minSubtotal.toFixed(2)}.`,
    };
  }

  const type = dc.type === "fixed" ? "fixed" : "percent";
  let discountAmount =
    type === "percent" ? (subtotal * dc.value) / 100 : dc.value;
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    message:
      type === "percent"
        ? `${dc.value}% off applied!`
        : `$${dc.value.toFixed(2)} off applied!`,
    code: dc.code,
    type,
    value: dc.value,
    discountAmount,
  };
}
