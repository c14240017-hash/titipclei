import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

const quoteCode = () => `QT-CN-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const { id } = await context.params;
  const body = await request.json();
  const values = ["productPrice", "exchangeRate", "shipping", "additionalCost", "serviceFee"] as const;
  const parsed = Object.fromEntries(values.map((key) => [key, Number(body[key] ?? 0)])) as Record<(typeof values)[number], number>;
  if (values.some((key) => !Number.isFinite(parsed[key]) || parsed[key] < 0)) return NextResponse.json({ error: "Semua nilai harga harus valid." }, { status: 400 });
  const quantity = Number(body.quantity ?? 1);
  const expiresAt = new Date(String(body.expiresAt));
  if (!Number.isInteger(quantity) || quantity < 1 || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) return NextResponse.json({ error: "Jumlah dan masa berlaku penawaran harus valid." }, { status: 400 });
  const item = await prisma.jastipRequest.findUnique({ where: { id }, include: { user: true } });
  if (!item) return NextResponse.json({ error: "Request tidak ditemukan." }, { status: 404 });
  const convertedProductCost = parsed.productPrice * quantity;
  const totalCost = convertedProductCost + parsed.shipping + parsed.additionalCost;
  const finalPrice = totalCost + parsed.serviceFee;
  const quotation = await prisma.$transaction(async (tx) => {
    const created = await tx.quotation.create({ data: {
      quotationNumber: quoteCode(), userId: item.userId, jastipRequestId: item.id, status: "SENT",
      originalCurrency: item.currencyCode, originalPrice: parsed.productPrice, quantity,
      marketExchangeRate: parsed.exchangeRate, appliedExchangeRate: parsed.exchangeRate,
      exchangeRateProvider: "Snapshot admin", exchangeRateTimestamp: new Date(),
      convertedProductCost, internationalShipping: parsed.shipping, additionalCost: parsed.additionalCost,
      serviceMarginType: "FIXED", serviceMarginValue: parsed.serviceFee, serviceFee: parsed.serviceFee,
      totalCost, profit: parsed.serviceFee, finalPrice, expiresAt,
    }});
    await tx.jastipRequest.update({ where: { id: item.id }, data: { status: "QUOTATION_SENT" } });
    return created;
  });
  revalidatePath(`/admin/requests/${id}`); revalidatePath("/admin");
  return NextResponse.json({ quotationId: quotation.id, publicToken: quotation.publicToken });
}
