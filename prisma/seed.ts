import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({ where: { email: "admin@jastiphub.com" }, update: { name: "Admin Jastip", passwordHash, role: "ADMIN" }, create: { name: "Admin Jastip", email: "admin@jastiphub.com", passwordHash, role: "ADMIN" } });
  for (const [name, slug] of [["Fashion", "fashion"], ["Sneakers", "sneakers"], ["Beauty", "beauty"], ["Electronics", "electronics"], ["Collectibles", "collectibles"], ["Lifestyle", "lifestyle"], ["Other", "other"]]) await prisma.category.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  console.log("Development admin and categories are ready. No business demo data was created.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
