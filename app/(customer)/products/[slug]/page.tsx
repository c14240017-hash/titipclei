import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductViewer } from "@/components/ProductViewer";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: { not: "CLOSED" } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: {
        include: { images: { orderBy: { sortOrder: "asc" } } },
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) notFound();

  // Convert to expected type
  const productData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    sellingPrice: Number(product.sellingPrice),
    imageUrl: product.imageUrl,
    images: product.images.map((image) => image.imageUrl),
    category: product.category,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      colorName: v.colorName,
      colorHex: v.colorHex,
      size: v.size,
      model: v.model,
      stock: v.stock,
      priceAdjustment: Number(v.priceAdjustment),
      images: v.images.map((img) => ({
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
      })),
    })),
  };

  return (
    <main className="min-h-screen bg-[#F7F8FC] py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#5B3DF5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke produk
        </Link>
        <div className="mt-6 overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white shadow-sm">
          <ProductViewer product={productData} />
        </div>
      </div>
    </main>
  );
}
