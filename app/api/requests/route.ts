import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIndonesianPhone } from "@/lib/phone";

const createRequestNumber = () => `REQ-CN-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.customerName || "").trim();
  const phone = normalizeIndonesianPhone(String(body.phone || ""));
  const productName = String(body.productName || "").trim();
  const email = String(body.email || "").trim() || null;
  const quantity = Number(body.quantity || 0);
  if (!name || !phone || !productName || !Number.isInteger(quantity) || quantity < 1) return NextResponse.json({ error: "Lengkapi nama, WhatsApp, nama barang, dan jumlah barang dengan benar." }, { status: 400 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  const existing = await prisma.user.findFirst({ where: { phone } });
  const customer = existing ? await prisma.user.update({ where: { id: existing.id }, data: { name, email: email ?? existing.email } }) : await prisma.user.create({ data: { name, phone, email } });
  const created = await prisma.jastipRequest.create({ data: { requestNumber: createRequestNumber(), userId: customer.id, productName, productUrl: String(body.productUrl || "").trim() || null, countryCode: "CN", currencyCode: "CNY", quantity, variant: String(body.variant || "").trim() || null, notes: String(body.notes || "").trim() || null } });
  return NextResponse.json({ requestNumber: created.requestNumber }, { status: 201 });
}
