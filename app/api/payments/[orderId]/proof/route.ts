import { NextRequest, NextResponse } from "next/server";
import { paymentDestination } from "@/lib/payment-settings";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params;
  const order = await prisma.order.findUnique({ where: { publicToken: orderId }, select: { id: true, total: true, publicToken: true } });
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const formData = await request.formData();
  const proof = formData.get("proof");
  if (!(proof instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(proof.type) || proof.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Bukti harus JPG, PNG, atau WEBP dengan ukuran maksimal 10 MB." }, { status: 400 });
  const proofImageUrl = `data:${proof.type};base64,${Buffer.from(await proof.arrayBuffer()).toString("base64")}`;
  const submittedAt = new Date();
  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: { orderId, amount: order.total, bankName: paymentDestination.bankName, destinationAccount: paymentDestination.accountNumber, accountHolder: paymentDestination.accountHolder, proofImageUrl, senderName: String(formData.get("senderName") || "") || null, notes: String(formData.get("notes") || "") || null, status: "WAITING_VERIFICATION", submittedAt },
    update: { proofImageUrl, senderName: String(formData.get("senderName") || "") || null, notes: String(formData.get("notes") || "") || null, status: "WAITING_VERIFICATION", submittedAt, rejectedAt: null, rejectionReason: null },
  });
  await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "WAITING_VERIFICATION", orderStatus: "WAITING_VERIFICATION" } });
  return NextResponse.json({ paymentId: payment.id, status: payment.status, redirectTo: `/order/success/${order.publicToken}` });
}
