import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.update({ where: { email: "admin@jastiphub.com" }, data: { passwordHash, role: "ADMIN" } });
  console.log("Development admin password reset successfully.");
}

main().finally(() => prisma.$disconnect());
