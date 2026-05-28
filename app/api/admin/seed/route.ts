import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// One-time seed endpoint — protect with secret token
// Accepts both GET (browser) and POST (curl/scripts)
async function handleSeed(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  const secret = process.env.SEED_SECRET || "seed123";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
  const existing = await prisma.product.count();
  if (existing > 0) {
    return NextResponse.json({ message: `Already seeded (${existing} products)` });
  }

  const products = [
    { title: "Pro Wireless Earbuds with Noise Cancellation", description: "Experience crystal-clear sound with our premium wireless earbuds. Features active noise cancellation, 30-hour battery life, and IPX5 water resistance.", price: 39.99, comparePrice: 79.99, images: JSON.stringify(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"]), category: "Electronics", tags: JSON.stringify(["wireless", "earbuds", "bluetooth"]), stock: 150, supplier: "cj", featured: true },
    { title: "Smart Watch Fitness Tracker", description: "Track your health and fitness goals with this advanced smartwatch. Heart rate monitoring, sleep tracking, GPS, and 7-day battery life.", price: 49.99, comparePrice: 99.99, images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]), category: "Electronics", tags: JSON.stringify(["smartwatch", "fitness"]), stock: 200, supplier: "cj", featured: true },
    { title: "4K Action Camera — Waterproof 40m", description: "Capture adventures in stunning 4K. Waterproof up to 40m, wide-angle lens, image stabilization, Wi-Fi. Bundle includes mounting accessories.", price: 59.99, comparePrice: 119.99, images: JSON.stringify(["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"]), category: "Electronics", tags: JSON.stringify(["camera", "4k", "waterproof"]), stock: 80, supplier: "cj", featured: true },
    { title: "Minimalist Leather Wallet — RFID Blocking", description: "Slim genuine leather wallet with RFID-blocking. Holds up to 8 cards and cash.", price: 24.99, comparePrice: 49.99, images: JSON.stringify(["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"]), category: "Fashion", tags: JSON.stringify(["wallet", "leather", "rfid"]), stock: 500, supplier: "aliexpress", featured: false },
    { title: "Premium Yoga Mat — Non-Slip 6mm", description: "Professional yoga mat with superior grip. 6mm thick, moisture-wicking, eco-friendly TPE. Includes carrying strap.", price: 34.99, comparePrice: 69.99, images: JSON.stringify(["https://images.unsplash.com/photo-1601925228269-52c07ef879c7?w=600"]), category: "Sports", tags: JSON.stringify(["yoga", "fitness", "mat"]), stock: 250, supplier: "cj", featured: true },
    { title: "LED Ring Light 18 inch with Tripod", description: "Professional 18-inch LED ring light. 3 color modes, 10 brightness levels. Perfect for streaming, TikTok, YouTube.", price: 44.99, comparePrice: 89.99, images: JSON.stringify(["https://images.unsplash.com/photo-1615986202427-9996228e43a5?w=600"]), category: "Electronics", tags: JSON.stringify(["ring light", "photography"]), stock: 120, supplier: "cj", featured: false },
    { title: "Stainless Steel Water Bottle — 32oz", description: "Double-wall vacuum insulated. Keeps cold 24h, hot 12h. BPA-free, leak-proof, wide mouth.", price: 22.99, comparePrice: 44.99, images: JSON.stringify(["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"]), category: "Sports", tags: JSON.stringify(["water bottle", "insulated"]), stock: 400, supplier: "aliexpress", featured: false },
    { title: "Silk Pillowcase Set — Queen (2-pack)", description: "Luxurious 100% mulberry silk pillowcases. Hypoallergenic, reduces hair breakage. Queen size.", price: 29.99, comparePrice: 59.99, images: JSON.stringify(["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"]), category: "Home", tags: JSON.stringify(["pillow", "silk", "bedroom"]), stock: 180, supplier: "cj", featured: true },
    { title: "Aromatherapy Essential Oil Diffuser 500ml", description: "Ultrasonic mist humidifier with 7-color LED. Covers 300 sq ft, runs 10 hours, auto shut-off.", price: 27.99, comparePrice: 54.99, images: JSON.stringify(["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600"]), category: "Home", tags: JSON.stringify(["diffuser", "aromatherapy"]), stock: 220, supplier: "aliexpress", featured: false },
    { title: "Resistance Band Set — 5 Levels", description: "5 resistance bands in different strengths. For home workouts, therapy, yoga. Durable latex, carry bag included.", price: 18.99, comparePrice: 37.99, images: JSON.stringify(["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"]), category: "Sports", tags: JSON.stringify(["resistance bands", "workout"]), stock: 350, supplier: "cj", featured: false },
    { title: "Women's Oversized Knit Sweater", description: "Cozy oversized knit. Soft acrylic blend, relaxed fit, ribbed cuffs. Available in 8 colors.", price: 32.99, comparePrice: 64.99, images: JSON.stringify(["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600"]), category: "Fashion", tags: JSON.stringify(["sweater", "knit", "women"]), stock: 280, supplier: "aliexpress", featured: true },
    { title: "Bamboo Desktop Organizer — 6 Compartments", description: "Elegant bamboo desk organizer. Eco-friendly, natural finish, fits any home office decor.", price: 26.99, comparePrice: 52.99, images: JSON.stringify(["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"]), category: "Home", tags: JSON.stringify(["organizer", "desk", "bamboo"]), stock: 160, supplier: "cj", featured: false },
    { title: "Vitamin C Face Serum — 30ml", description: "Brightening serum with 20% Vitamin C, hyaluronic acid and Vitamin E. Reduces dark spots, boosts collagen.", price: 21.99, comparePrice: 43.99, images: JSON.stringify(["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"]), category: "Beauty", tags: JSON.stringify(["serum", "vitamin c", "skincare"]), stock: 300, supplier: "aliexpress", featured: true },
    { title: "Kids STEM Building Blocks — 500 pcs", description: "Educational building blocks. Develops creativity, motor skills, STEM thinking. For ages 4+.", price: 36.99, comparePrice: 72.99, images: JSON.stringify(["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"]), category: "Toys", tags: JSON.stringify(["blocks", "kids", "stem"]), stock: 200, supplier: "cj", featured: false },
    { title: "Portable Magnetic Phone Stand", description: "Versatile magnetic stand, MagSafe-compatible. Adjustable angles, perfect for desk and video calls.", price: 19.99, comparePrice: 39.99, images: JSON.stringify(["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"]), category: "Electronics", tags: JSON.stringify(["phone stand", "magsafe"]), stock: 300, supplier: "aliexpress", featured: false },
    { title: "Collapsible Silicone Food Containers — Set of 4", description: "Space-saving collapsible containers. BPA-free, freezer and microwave safe, leakproof lids.", price: 23.99, comparePrice: 47.99, images: JSON.stringify(["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"]), category: "Home", tags: JSON.stringify(["food storage", "silicone", "kitchen"]), stock: 240, supplier: "cj", featured: false },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  return NextResponse.json({ success: true, created: products.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "DB_ERROR", detail: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleSeed(req);
}

export async function POST(req: NextRequest) {
  return handleSeed(req);
}
