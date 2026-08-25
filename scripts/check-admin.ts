import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) { console.log(JSON.stringify({ databaseUrlConfigured: false })); return; }
  try { const parsed = new URL(databaseUrl); console.log(JSON.stringify({ databaseUrlConfigured: true, protocol: parsed.protocol, host: parsed.host, usernamePresent: Boolean(parsed.username), passwordPresent: Boolean(parsed.password), passwordLength: parsed.password.length })); } catch { console.log(JSON.stringify({ databaseUrlConfigured: true, validUrl: false })); return; }
  const user = await prisma.user.findUnique({ where: { email: "admin@jastiphub.com" }, select: { role: true, passwordHash: true } });
  console.log(JSON.stringify({ exists: !!user, role: user?.role ?? null, hasPasswordHash: !!user?.passwordHash, passwordMatchesDevSeed: user?.passwordHash ? await bcrypt.compare("admin123", user.passwordHash) : false }));
}

main().finally(() => prisma.$disconnect());
