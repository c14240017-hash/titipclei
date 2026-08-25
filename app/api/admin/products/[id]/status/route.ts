import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

export async function PATCH(_: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    const updated = await prisma.product.update({ where: { id }, data: { status: product.status === "CLOSED" ? "OPEN" : "CLOSED" } });
    revalidatePath("/admin/products"); revalidatePath("/products"); revalidatePath("/"); revalidatePath(`/products/${updated.slug}`);
    return NextResponse.json({ product: updated, status: updated.status });
  } catch {
    return NextResponse.json({ error: "Status produk gagal diubah." }, { status: 400 });
  }
}
