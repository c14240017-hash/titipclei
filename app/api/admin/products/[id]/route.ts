import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { prepareProductSave } from "@/lib/pricing/product-save";
import { deleteStoredProductImage } from "@/lib/storage/product-images";

function revalidateProductRoutes(slug: string) {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  try {
    const { id } = await context.params;
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { exchangeRate: true, exchangeRateSource: true, exchangeRateDate: true, updatedAt: true, imageUrl: true },
    });
    if (!existing) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

    // The calculator preview is never trusted: pricing is recalculated in prepareProductSave.
    const prepared = await prepareProductSave(await request.json(), {
      marketRate: existing.exchangeRate,
      provider: existing.exchangeRateSource,
      sourceDate: existing.exchangeRateDate,
      fetchedAt: existing.updatedAt,
    });
    // We will delete existing variants and recreate them for simplicity
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: prepared.input.name,
        description: prepared.input.description || null,
        imageUrl: prepared.input.imageUrl || null,
        brand: prepared.input.brand || null,
        categoryId: prepared.input.categoryId || null,
        ...prepared.data,
        images: { deleteMany: {}, create: (prepared.input.imageUrls || (prepared.input.imageUrl ? [prepared.input.imageUrl] : [])).map((imageUrl: string, idx: number) => ({ imageUrl, sortOrder: idx, isPrimary: idx === 0 })) },
        variants: {
          create: prepared.input.variants?.map((v) => ({
            name: v.name,
            colorName: v.colorName,
            colorHex: v.colorHex,
            size: v.size,
            model: v.model,
            stock: Number(v.stock) || 0,
            priceAdjustment: Number(v.priceAdjustment) || 0,
            images: {
              create: v.images?.map((url: string, idx: number) => ({
                imageUrl: url,
                sortOrder: idx,
                isPrimary: idx === 0
              })) || []
            }
          })) || []
        }
      },
    });
    if (existing.imageUrl && existing.imageUrl !== product.imageUrl) await deleteStoredProductImage(existing.imageUrl).catch(() => undefined);
    if (process.env.NODE_ENV === "development") {
      console.log("PRODUCT PRICING SAVE", {
        id: product.id,
        purchasePriceCny: product.originalPrice.toString(),
        exchangeRate: product.exchangeRate.toString(),
        totalCost: product.totalCost.toString(),
        marginPercentage: product.marginPercentage?.toString() ?? null,
        profit: product.profit.toString(),
        sellingPrice: product.sellingPrice.toString(),
      });
    }
    revalidateProductRoutes(product.slug);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Produk tidak dapat diperbarui." }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  try {
    const { id } = await context.params;
    const product = await prisma.product.delete({ where: { id }, select: { id: true, slug: true, imageUrl: true } });
    await deleteStoredProductImage(product.imageUrl).catch(() => undefined);
    revalidateProductRoutes(product.slug);
    return NextResponse.json({ product, success: true });
  } catch {
    return NextResponse.json({ error: "Produk tidak dapat dihapus." }, { status: 400 });
  }
}
