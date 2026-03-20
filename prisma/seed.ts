import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
async function main() {
  await prisma.product.deleteMany();

  const products = [
    {
      name: "Classic White Tee",
      description: "Premium cotton white t-shirt",
      price: 12000,
      images: [
        "https://res.cloudinary.com/dgvk232bh/image/upload/v1769074305/IMG_9_jzqj6l.jpg",
      ],
      filters: ["tops", "t-shirts"],
      colors: [
        { name: "White", hex: "#FFFFFF" },
      ],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Black Essential Tee",
      description: "Minimal black t-shirt",
      price: 12000,
      images: [
        "https://res.cloudinary.com/dgvk232bh/image/upload/v1769074304/IMG_3_wotuzk.jpg",
      ],
      filters: ["tops", "t-shirts"],
      colors: [
        { name: "Black", hex: "#000000" },
      ],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Luxury Polo Shirt",
      description: "Tailored polo with premium finish",
      price: 18000,
      images: [
        "https://res.cloudinary.com/dgvk232bh/image/upload/v1769074304/IMG_8_avl6dj.jpg",
      ],
      filters: ["tops", "polo"],
      colors: [
        { name: "Navy", hex: "#001F54" },
        { name: "White", hex: "#FFFFFF" },
      ],
      sizes: ["M", "L", "XL"],
    },
    {
      name: "Slim Fit Jeans",
      description: "Dark wash slim-fit jeans",
      price: 25000,
      images: [
        "https://res.cloudinary.com/dgvk232bh/image/upload/v1769074304/IMG_4_dko6jk.jpg",
      ],
      filters: ["bottoms", "jeans"],
      colors: [
        { name: "Blue", hex: "#1E3A8A" },
      ],
      sizes: ["30", "32", "34", "36"],
    },
    {
      name: "Tailored Trousers",
      description: "Formal tailored trousers",
      price: 30000,
      images: [
        "https://res.cloudinary.com/dgvk232bh/image/upload/v1769074290/IMG_5_y7frd2.jpg",
      ],
      filters: ["bottoms", "trousers"],
      colors: [
        { name: "Black", hex: "#000000" },
        { name: "Grey", hex: "#6B7280" },
      ],
      sizes: ["30", "32", "34", "36"],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        colors: product.colors, 
      },
    });
  }

  console.log(`✅ ${products.length} products seeded successfully`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
