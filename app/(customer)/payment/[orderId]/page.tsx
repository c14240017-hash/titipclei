import { Landmark, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { OrderAddressForm } from "@/components/OrderAddressForm";
import { PaymentForm } from "@/components/PaymentForm";
import { paymentDestination } from "@/lib/payment-settings";
import { prisma } from "@/lib/prisma";

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { publicToken: orderId } });
  if (!order) notFound();

  const hasShippingAddress = Boolean(order.recipientName && order.recipientPhone && order.addressLine && order.city && order.province && order.postalCode);

  return (
    <main className="min-h-screen bg-[#FFF9F5] py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-wider text-[#B95F70]">Checkout Pesanan</p>
        <h1 className="mt-2 text-3xl font-bold text-[#4B342F]">Selesaikan Pembayaran</h1>
        <p className="mt-2 text-[#725A53]">Lengkapi alamat pengiriman, lalu unggah bukti pembayaran untuk melanjutkan pesanan.</p>
        <p className="mt-3 text-sm font-semibold text-[#4B342F]">Kode Pesanan: {order.orderNumber}</p>

        <div className="mt-7 grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <section className="rounded-2xl border border-[#E8D8D1] bg-[#FFFDFC] p-6 shadow-sm">
              <h2 className="font-bold text-[#4B342F]">Ringkasan Pesanan</h2>
              <p className="mt-4 font-semibold text-[#4B342F]">{order.productNameSnapshot}</p>
              <p className="mt-1 text-sm text-[#725A53]">Jumlah: {order.quantity} · Varian: {order.variantNameSnapshot || order.variant || "-"}</p>
            </section>

            {hasShippingAddress ? (
              <section className="rounded-2xl border border-[#E8D8D1] bg-[#FFFDFC] p-6 shadow-sm">
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-[#D98392]" /><h2 className="font-bold text-[#4B342F]">Alamat Pengiriman</h2></div>
                <p className="mt-4 font-semibold text-[#4B342F]">{order.recipientName} · {order.recipientPhone}</p>
                <p className="mt-1 text-sm leading-6 text-[#725A53]">{order.addressLine}<br />{order.city}, {order.province} {order.postalCode}</p>
                {order.shippingNote && <p className="mt-3 rounded-lg bg-[#FBECEF] px-3 py-2 text-sm text-[#704433]">Catatan: {order.shippingNote}</p>}
              </section>
            ) : (
              <OrderAddressForm orderId={orderId} name={order.customerName} phone={order.customerPhone} address={{ recipientName: order.recipientName, recipientPhone: order.recipientPhone, addressLine: order.addressLine, city: order.city, province: order.province, postalCode: order.postalCode, shippingNote: order.shippingNote }} />
            )}

            <section className="rounded-2xl bg-[#4B342F] p-6 text-[#FFF9F5]">
              <p className="text-sm text-[#F3DDD8]">Total yang Harus Ditransfer</p>
              <p className="mt-2 text-3xl font-extrabold">Rp {Math.round(Number(order.total) || 0).toLocaleString("id-ID")}</p>
              <p className="mt-3 text-sm text-[#F3DDD8]">Nominal ini berasal dari pesanan dan tidak dapat diubah.</p>
            </section>

            <section className="rounded-2xl border border-[#E8D8D1] bg-[#FFFDFC] p-6 shadow-sm">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FBECEF] text-[#B95F70]"><Landmark className="h-5 w-5" /></span><h2 className="font-bold text-[#4B342F]">Rekening Tujuan</h2></div>
              <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-[#8A6F67]">Bank</dt><dd className="mt-1 font-bold text-[#4B342F]">{paymentDestination.bankName}</dd></div><div><dt className="text-[#8A6F67]">Nomor Rekening</dt><dd className="mt-1 font-bold text-[#4B342F]">{paymentDestination.accountNumber}</dd></div><div><dt className="text-[#8A6F67]">Atas Nama</dt><dd className="mt-1 font-bold text-[#4B342F]">{paymentDestination.accountHolder}</dd></div></dl>
            </section>
          </div>

          <aside className="lg:col-span-2"><section className="rounded-2xl border border-[#E8D8D1] bg-[#FBECEF] p-6"><h2 className="font-bold text-[#4B342F]">Cara Pembayaran</h2><ol className="mt-4 list-decimal space-y-3 pl-4 text-sm leading-6 text-[#725A53]"><li>Lengkapi alamat pengiriman.</li><li>Transfer sesuai nominal yang tertera.</li><li>Pastikan rekening tujuan sudah benar.</li><li>Upload bukti pembayaran.</li><li>Tunggu pembayaran diverifikasi.</li></ol></section></aside>
        </div>

        {hasShippingAddress ? <PaymentForm orderId={orderId} total={order.total} {...paymentDestination} /> : <p className="mt-6 rounded-xl border border-[#E8D8D1] bg-[#FFFDFC] p-4 text-sm text-[#725A53]">Simpan alamat pengiriman untuk melanjutkan upload bukti pembayaran.</p>}
      </div>
    </main>
  );
}
