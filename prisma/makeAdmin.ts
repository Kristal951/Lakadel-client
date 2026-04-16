import dotenv from "dotenv";
dotenv.config();
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "lakadel.lkdl@gmail.com";

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log("Updated:", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
