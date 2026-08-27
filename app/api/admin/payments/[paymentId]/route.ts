import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const { paymentId } = await context.params;
  const { action, reason } = await request.json() as { action?: string; reason?: string };
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { id: true, orderId: true } });
  if (!payment) return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
  const verified = action === "verify";
  if (!verified && action !== "reject") return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  await prisma.$transaction(async (tx) => {
    if (verified) {
      const claimed = await tx.payment.updateMany({
        where: { id: paymentId, status: { not: "VERIFIED" } },
        data: { status: "VERIFIED", verifiedAt: new Date(), rejectedAt: null, rejectionReason: null },
      });
      if (!claimed.count) return;
    }
    if (!verified) {
      const rejected = await tx.payment.updateMany({
        where: { id: paymentId, status: { not: "VERIFIED" } },
        data: { status: "REJECTED", rejectedAt: new Date(), rejectionReason: reason || "Bukti pembayaran belum dapat diverifikasi." },
      });
      if (!rejected.count) return;
    }
    await tx.order.update({ where: { id: payment.orderId }, data: verified ? { paymentStatus: "VERIFIED", orderStatus: "PURCHASING" } : { paymentStatus: "REJECTED", orderStatus: "WAITING_PAYMENT" } });
    if (verified) {
      await tx.orderTracking.createMany({ data: [
        { orderId: payment.orderId, status: "PAID", description: "Pembayaran berhasil diverifikasi." },
        { orderId: payment.orderId, status: "PURCHASING", description: "Pesanan masuk proses pembelian." },
      ] });
    }
  });
  revalidatePath("/admin"); revalidatePath("/admin/payments"); revalidatePath("/admin/orders"); revalidatePath("/track"); revalidatePath("/order/success/[token]", "page");
  return NextResponse.json({ success: true });
}
