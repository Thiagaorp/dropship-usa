import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    supplierId, title, supplierPrice, suggestedPrice,
    image, category, supplier, supplierUrl,
    markup = 2.5,
  } = body;

  const price = suggestedPrice ?? Math.round(supplierPrice * markup * 100) / 100;
  const comparePrice = Math.round(price * 1.3 * 100) / 100;

  const product = await prisma.product.create({
    data: {
      title,
      description: `High-quality ${title}. Sourced from verified suppliers. Fast shipping to USA.`,
      price,
      comparePrice,
      images: JSON.stringify([image]),
      category: category ?? "Other",
      tags: JSON.stringify([category, supplier].filter(Boolean)),
      stock: 999,
      supplier: supplier ?? "cj",
      supplierUrl,
      supplierId,
      active: true,
      featured: false,
    },
  });

  return NextResponse.json({
    product: {
      ...product,
      images: JSON.parse(product.images) as string[],
      tags: JSON.parse(product.tags) as string[],
    },
  }, { status: 201 });
}
