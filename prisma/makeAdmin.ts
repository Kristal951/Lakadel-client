import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "lakadel.lkdl@gmail.com"; 
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log("Updated:", user.email, user.role);
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
