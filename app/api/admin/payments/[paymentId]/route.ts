import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

export async function PATCH(request: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const { paymentId } = await context.params;
  const { action, reason } = await request.json() as { action?: string; reason?: string };
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { id: true, orderId: true } });
  if (!payment) return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
  const verified = action === "verify";
  if (!verified && action !== "reject") return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  await prisma.$transaction([
    prisma.payment.update({ where: { id: paymentId }, data: verified ? { status: "VERIFIED", verifiedAt: new Date(), rejectedAt: null, rejectionReason: null } : { status: "REJECTED", rejectedAt: new Date(), rejectionReason: reason || "Bukti pembayaran belum dapat diverifikasi." } }),
    prisma.order.update({ where: { id: payment.orderId }, data: verified ? { paymentStatus: "VERIFIED", orderStatus: "PAID" } : { paymentStatus: "REJECTED", orderStatus: "WAITING_PAYMENT" } }),
  ]);
  return NextResponse.json({ success: true });
}
