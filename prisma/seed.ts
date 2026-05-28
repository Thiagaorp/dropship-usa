import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const products = [
  {
    title: "Pro Wireless Earbuds with Noise Cancellation",
    description: "Experience crystal-clear sound with our premium wireless earbuds. Features active noise cancellation, 30-hour battery life, and IPX5 water resistance. Perfect for workouts, commuting, or just enjoying your favorite music.",
    price: 39.99,
    comparePrice: 79.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"]),
    category: "Electronics",
    tags: JSON.stringify(["wireless", "earbuds", "bluetooth", "noise-cancellation"]),
    stock: 150,
    supplier: "cj",
    featured: true,
  },
  {
    title: "Smart Watch Fitness Tracker with Heart Rate Monitor",
    description: "Track your health and fitness goals with this advanced smartwatch. Features heart rate monitoring, sleep tracking, GPS, and 7-day battery life. Compatible with iOS and Android.",
    price: 49.99,
    comparePrice: 99.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]),
    category: "Electronics",
    tags: JSON.stringify(["smartwatch", "fitness", "health"]),
    stock: 200,
    supplier: "cj",
    featured: true,
  },
  {
    title: "Portable Magnetic Phone Stand & MagSafe Charger",
    description: "A versatile magnetic phone stand that works with all MagSafe-compatible cases. Adjustable viewing angles, perfect for desk use, video calls, and content viewing.",
    price: 19.99,
    comparePrice: 39.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"]),
    category: "Electronics",
    tags: JSON.stringify(["phone stand", "magsafe", "charger"]),
    stock: 300,
    supplier: "aliexpress",
    featured: false,
  },
  {
    title: "4K Action Camera — Waterproof 40m",
    description: "Capture your adventures in stunning 4K ultra HD. Waterproof up to 40 meters, includes wide-angle lens, image stabilization, and Wi-Fi connectivity. Bundle includes mounting accessories.",
    price: 59.99,
    comparePrice: 119.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"]),
    category: "Electronics",
    tags: JSON.stringify(["camera", "action cam", "4k", "waterproof"]),
    stock: 80,
    supplier: "cj",
    featured: true,
  },
  {
    title: "Minimalist Leather Wallet — RFID Blocking",
    description: "Slim, stylish wallet crafted from genuine leather with RFID-blocking technology. Holds up to 8 cards and cash. Available in multiple colors.",
    price: 24.99,
    comparePrice: 49.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"]),
    category: "Fashion",
    tags: JSON.stringify(["wallet", "leather", "rfid", "minimalist"]),
    stock: 500,
    supplier: "aliexpress",
    featured: false,
  },
  {
    title: "Premium Yoga Mat — Non-Slip 6mm",
    description: "Professional-grade yoga mat with superior grip on both sides. 6mm thick for joint comfort, moisture-wicking, and eco-friendly TPE material. Includes carrying strap.",
    price: 34.99,
    comparePrice: 69.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1601925228269-52c07ef879c7?w=600"]),
    category: "Sports",
    tags: JSON.stringify(["yoga", "fitness", "mat", "exercise"]),
    stock: 250,
    supplier: "cj",
    featured: true,
  },
  {
    title: "LED Ring Light 18 inch with Tripod Stand",
    description: "Professional photography and video lighting kit. 18-inch LED ring light with 3 color modes and 10 brightness levels. Perfect for streaming, TikTok, YouTube, and photography.",
    price: 44.99,
    comparePrice: 89.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1615986202427-9996228e43a5?w=600"]),
    category: "Electronics",
    tags: JSON.stringify(["ring light", "photography", "lighting", "streaming"]),
    stock: 120,
    supplier: "cj",
    featured: false,
  },
  {
    title: "Stainless Steel Water Bottle — 32oz Insulated",
    description: "Double-wall vacuum insulated water bottle keeps drinks cold 24 hours and hot 12 hours. BPA-free, leak-proof lid, wide mouth design. Perfect for gym, hiking, and office.",
    price: 22.99,
    comparePrice: 44.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"]),
    category: "Sports",
    tags: JSON.stringify(["water bottle", "insulated", "gym", "eco"]),
    stock: 400,
    supplier: "aliexpress",
    featured: false,
  },
  {
    title: "Silk Pillowcase Set — Queen Size (2-pack)",
    description: "Luxurious 100% mulberry silk pillowcases. Naturally hypoallergenic, reduces hair breakage and skin wrinkles. Queen size, available in multiple colors.",
    price: 29.99,
    comparePrice: 59.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"]),
    category: "Home",
    tags: JSON.stringify(["pillow", "silk", "bedroom", "luxury"]),
    stock: 180,
    supplier: "cj",
    featured: true,
  },
  {
    title: "Aromatherapy Essential Oil Diffuser — 500ml",
    description: "Ultrasonic mist humidifier with 7-color LED night light. Covers up to 300 sq ft, runs up to 10 hours, auto shut-off. Includes remote control.",
    price: 27.99,
    comparePrice: 54.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600"]),
    category: "Home",
    tags: JSON.stringify(["diffuser", "aromatherapy", "home", "relaxation"]),
    stock: 220,
    supplier: "aliexpress",
    featured: false,
  },
  {
    title: "Resistance Band Set — 5 Levels",
    description: "Complete set of 5 resistance bands in different strengths. Perfect for home workouts, physical therapy, and yoga. Made from durable latex, includes carry bag.",
    price: 18.99,
    comparePrice: 37.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"]),
    category: "Sports",
    tags: JSON.stringify(["resistance bands", "workout", "fitness", "home gym"]),
    stock: 350,
    supplier: "cj",
    featured: false,
  },
  {
    title: "Women's Oversized Knit Sweater",
    description: "Cozy and fashionable oversized knit sweater. Made from soft acrylic blend, relaxed fit, ribbed cuffs and hem. Available in 8 colors. One size fits most.",
    price: 32.99,
    comparePrice: 64.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600"]),
    category: "Fashion",
    tags: JSON.stringify(["sweater", "knit", "women", "cozy"]),
    stock: 280,
    supplier: "aliexpress",
    featured: true,
  },
  {
    title: "Wooden Desktop Organizer — 6 Compartments",
    description: "Elegant bamboo desk organizer with 6 compartments for pens, scissors, phones, and more. Eco-friendly bamboo, natural finish, fits any home office decor.",
    price: 26.99,
    comparePrice: 52.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"]),
    category: "Home",
    tags: JSON.stringify(["organizer", "desk", "bamboo", "office"]),
    stock: 160,
    supplier: "cj",
    featured: false,
  },
  {
    title: "Kids' STEM Building Blocks Set — 500 pcs",
    description: "Educational building block set with 500 colorful pieces. Develops creativity, motor skills, and STEM thinking. Compatible with major brands. For ages 4+.",
    price: 36.99,
    comparePrice: 72.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"]),
    category: "Toys",
    tags: JSON.stringify(["blocks", "kids", "stem", "educational"]),
    stock: 200,
    supplier: "cj",
    featured: false,
  },
  {
    title: "Vitamin C Face Serum — 30ml",
    description: "Brightening face serum with 20% vitamin C, hyaluronic acid, and vitamin E. Reduces dark spots, evens skin tone, and boosts collagen. Suitable for all skin types.",
    price: 21.99,
    comparePrice: 43.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"]),
    category: "Beauty",
    tags: JSON.stringify(["serum", "vitamin c", "skincare", "brightening"]),
    stock: 300,
    supplier: "aliexpress",
    featured: true,
  },
  {
    title: "Collapsible Silicone Food Containers — Set of 4",
    description: "Space-saving collapsible silicone containers in 4 sizes. BPA-free, freezer and microwave safe, leakproof lids. Perfect for meal prep and food storage.",
    price: 23.99,
    comparePrice: 47.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"]),
    category: "Home",
    tags: JSON.stringify(["food storage", "silicone", "kitchen", "eco"]),
    stock: 240,
    supplier: "cj",
    featured: false,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ Created ${products.length} products`);

  // Demo order
  const firstProduct = await prisma.product.findFirst();
  if (firstProduct) {
    await prisma.order.create({
      data: {
        orderNumber: "SDU-DEMO-0001",
        customerName: "John Smith",
        customerEmail: "john@example.com",
        customerPhone: "+1 (555) 123-4567",
        shippingAddress: JSON.stringify({
          firstName: "John", lastName: "Smith",
          address1: "123 Main St", city: "Los Angeles",
          state: "CA", zipCode: "90001", country: "US",
        }),
        subtotal: firstProduct.price,
        shipping: 0,
        tax: firstProduct.price * 0.08,
        total: firstProduct.price * 1.08,
        status: "processing",
        paymentStatus: "paid",
        items: {
          create: [{
            productId: firstProduct.id,
            quantity: 1,
            price: firstProduct.price,
            title: firstProduct.title,
            image: JSON.parse(firstProduct.images)[0],
          }],
        },
      },
    });
    console.log("✅ Created demo order");
  }

  console.log("🎉 Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
