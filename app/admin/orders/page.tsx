import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/require-admin";
import { Search } from "lucide-react";
import { orderStatusMap } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminPage();
  
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelola Pesanan</h1>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Order ID / Tanggal</th>
              <th className="px-6 py-4 font-semibold">Pelanggan</th>
              <th className="px-6 py-4 font-semibold">Produk</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const statusInfo = orderStatusMap[order.orderStatus];
              return (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-slate-500 text-xs mt-1">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium truncate max-w-xs" title={order.productNameSnapshot || undefined}>{order.productNameSnapshot}</p>
                    <p className="text-slate-500 text-xs mt-1">{order.quantity} pcs</p>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    Rp {Number(order.total).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-${statusInfo?.color || "slate"}-50 text-${statusInfo?.color || "slate"}-700 border border-${statusInfo?.color || "slate"}-200`}>
                      {statusInfo?.label || order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
            
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Belum ada pesanan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
