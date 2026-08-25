import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/require-admin";
import { AdminProductsTable } from "@/components/AdminProductsTable";
import { toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string }> }) {
  await requireAdminPage();
  const query = await searchParams;
  const q = query.q || "";
  const category = query.category || "";
  const status = query.status || "";
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        AND: [
          q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }] } : {},
          category ? { category: { slug: category } } : {},
          status ? { status: status as "OPEN" | "CLOSING_SOON" | "CLOSED" } : {},
        ],
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <div className="mx-auto max-w-7xl"><div className="flex items-end justify-between"><div><h1 className="text-3xl font-bold">Manajemen Produk</h1><p className="mt-2 text-slate-500">Katalog produk yang tersimpan di database.</p></div><Link href="/admin/products/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Tambah Produk</Link></div><AdminProductsTable products={products.map((product) => {
    const originalPrice = toNumber(product.originalPrice);
    const exchangeRate = toNumber(product.exchangeRate);
    const totalCost = toNumber(product.totalCost);
    const profit = toNumber(product.profit);
    const sellingPrice = toNumber(product.sellingPrice);
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      originalPrice,
      exchangeRate,
      totalCost,
      marginType: product.marginType,
      marginPercentage: product.marginPercentage === null ? null : toNumber(product.marginPercentage),
      marginFixed: product.marginFixed === null ? null : toNumber(product.marginFixed),
      profit,
      sellingPrice,
      status: product.status,
      category: product.category?.name ?? "Other",
      // Zero is valid for profit when an admin intentionally sets a 0% margin.
      needsPricing: originalPrice <= 0 || exchangeRate <= 0 || totalCost <= 0 || sellingPrice <= 0,
    };
  })} categories={categories.map((item) => ({ name: item.name, slug: item.slug }))} query={{ q, category, status }} /></div>;
}
