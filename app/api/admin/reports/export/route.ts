import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  const access = await requireAdminApi(); if (access.response) return access.response;
  const orders = await prisma.order.findMany({ include: { user: true, quotation: true, orderTracking: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { createdAt: "desc" } });
  const headers = ["Order ID", "Tanggal", "Customer", "WhatsApp", "Total Pembayaran", "Harga Modal", "Profit", "Payment Status", "Order Status", "Tracking Number"];
  const rows = orders.map((order) => [order.orderNumber, order.createdAt.toISOString(), order.user?.name, order.user?.phone, order.total, order.quotation?.totalCost, order.quotation?.profit, order.paymentStatus, order.orderStatus, order.orderTracking[0]?.trackingNumber]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="jastiphub-laporan-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
