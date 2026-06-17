import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    select: { id: true, title: true, price: true },
  });

  const updates = await Promise.all(
    products.map(async (p) => {
      const multiplier = p.price > 15 ? 2.0 : 2.5;
      const newPrice = parseFloat((p.price * multiplier).toFixed(2));
      const newCompare = parseFloat((newPrice * 1.30).toFixed(2));
      await prisma.product.update({
        where: { id: p.id },
        data: { price: newPrice, comparePrice: newCompare },
      });
      return { title: p.title.slice(0, 40), old: p.price, new: newPrice, multiplier };
    })
  );

  return NextResponse.json({ updated: updates.length, products: updates });
}
