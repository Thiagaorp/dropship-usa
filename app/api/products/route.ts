import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const page = parseInt(searchParams.get("page") ?? "1");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { active: true };
  if (category) where.category = category;
  if (featured) where.featured = true;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  const products = rawProducts.map((p) => ({
    ...p,
    images: JSON.parse(p.images) as string[],
    tags: JSON.parse(p.tags) as string[],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, description, price, comparePrice, images, category,
    tags, stock, sku, weight, supplier, supplierUrl, supplierId,
    active, featured,
  } = body;

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      comparePrice,
      images: JSON.stringify(images ?? []),
      category,
      tags: JSON.stringify(tags ?? []),
      stock: stock ?? 100,
      sku,
      weight,
      supplier: supplier ?? "aliexpress",
      supplierUrl,
      supplierId,
      active: active ?? true,
      featured: featured ?? false,
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
