import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const raw = await prisma.product.findUnique({ where: { id } });
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = {
    ...raw,
    images: JSON.parse(raw.images) as string[],
    tags: JSON.parse(raw.tags) as string[],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  const rawRelated = await prisma.product.findMany({
    where: { category: raw.category, active: true, id: { not: id } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const related = rawRelated.map((p) => ({
    ...p,
    images: JSON.parse(p.images) as string[],
    tags: JSON.parse(p.tags) as string[],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return NextResponse.json({ product, related });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = { ...body };
  if (body.images) data.images = JSON.stringify(body.images);
  if (body.tags) data.tags = JSON.stringify(body.tags);
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  const product = await prisma.product.update({ where: { id }, data });

  return NextResponse.json({
    product: {
      ...product,
      images: JSON.parse(product.images) as string[],
      tags: JSON.parse(product.tags) as string[],
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
