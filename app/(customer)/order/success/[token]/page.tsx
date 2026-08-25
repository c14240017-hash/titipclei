import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatusCard } from "@/components/order-status/OrderStatusCard";
import { ProgressTimeline } from "@/components/order-status/ProgressTimeline";

export const dynamic = "force-dynamic";
export default async function OrderSuccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const order = await prisma.order.findUnique({ where: { publicToken: token }, include: { payment: true } }); if (!order) notFound();
  return <main className="min-h-screen bg-[#F7F8FC] py-12"><div className="mx-auto max-w-2xl space-y-6 px-4"><section className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm"><p className="text-sm font-bold uppercase tracking-wider text-emerald-600">Bukti Pembayaran Sedang Diverifikasi</p><h1 className="mt-3 text-3xl font-extrabold text-[#0F1B38]">Bukti transfermu sudah kami terima.</h1><p className="mt-4 text-slate-600">Kamu tidak perlu melakukan pembayaran ulang.</p><div className="mt-6 rounded-2xl bg-[#F1EEFF] p-5"><p className="text-sm text-slate-600">Kode Pesanan</p><p className="mt-1 text-2xl font-extrabold text-[#5B3DF5]">{order.orderNumber}</p><p className="mt-4 text-sm text-slate-600">{order.productNameSnapshot} · Rp {order.total.toLocaleString("id-ID")}</p></div></section><OrderStatusCard status={order.orderStatus} paymentStatus={order.paymentStatus} paymentProofSent={Boolean(order.payment?.proofImageUrl || order.payment?.proofStorageKey)} orderNumber={order.publicToken} /><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-[#0F1B38]">Proses Pesanan</h2><ProgressTimeline currentStatus={order.orderStatus} /></section><Link href="/track" className="inline-flex rounded-xl bg-[#5B3DF5] px-5 py-3 font-semibold text-white">Cek Status Pesanan</Link></div></main>;
}
