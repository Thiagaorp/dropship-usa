import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const products = await prisma.product.findMany({
  select: { id: true, title: true, price: true, comparePrice: true },
  orderBy: { price: "asc" },
});

console.log("\nPreços atuais → novos preços:");
console.log("─".repeat(60));

for (const p of products) {
  const multiplier = p.price > 15 ? 2.0 : 2.5;
  const newPrice = parseFloat((p.price * multiplier).toFixed(2));
  const newCompare = parseFloat((newPrice * 1.30).toFixed(2));
  console.log(`$${p.price.toFixed(2)} → $${newPrice.toFixed(2)} (x${multiplier})  ${p.title.slice(0, 45)}`);
  await prisma.product.update({
    where: { id: p.id },
    data: { price: newPrice, comparePrice: newCompare },
  });
}

console.log("\nPreços atualizados!");
await prisma.$disconnect();
