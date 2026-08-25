import Link from "next/link";
import { Package2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: { not: "CLOSED" } },
    include: { category: true, variants: { where: { status: "ACTIVE" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#F7F8FC] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-wider text-[#5B3DF5]">
          Katalog JastipHub
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F1B38]">
          Semua Produk dari China
        </h1>
        <p className="mt-2 text-slate-600">
          Temukan barang pilihan yang tersedia untuk jastip.
        </p>
        
        {products.length ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const hasVariants = product.variants.length > 0;
              const hasDifferentPrices = hasVariants && product.variants.some(v => Number(v.priceAdjustment || 0) > 0);
              
              return (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.id}
                  className="group rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="aspect-[4/3] w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center rounded-xl bg-[#F1EEFF]">
                      <Package2 className="h-14 w-14 text-violet-300" />
                    </div>
                  )}
                  
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#5B3DF5]">
                    {product.category?.name ?? "Produk"}
                  </p>
                  
                  <h2 className="mt-2 min-h-12 font-bold text-[#0F1B38] group-hover:text-[#5B3DF5]">
                    {product.name}
                  </h2>
                  
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {product.description}
                  </p>
                  
                  <p className="mt-5 text-xl font-extrabold text-[#0F1B38]">
                    {hasDifferentPrices && <span className="text-xs text-slate-500 font-normal mr-1 block">Mulai dari</span>}
                    Rp {Number(product.sellingPrice).toLocaleString("id-ID")}
                  </p>
                  
                  <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {product.status === "CLOSING_SOON"
                      ? "Segera tutup"
                      : "Open Jastip"}
                  </span>
                  
                  <span className="mt-4 block rounded-xl bg-[#F1EEFF] py-2.5 text-center text-sm font-semibold text-[#5B3DF5] group-hover:bg-[#5B3DF5] group-hover:text-white">
                    Lihat Produk
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 grid min-h-72 place-items-center rounded-2xl border border-dashed border-[#E6E8F0] bg-white p-6 text-center">
            <div>
              <Package2 className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-4 font-bold text-[#0F1B38]">
                Belum ada produk
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Katalog akan segera diperbarui.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
