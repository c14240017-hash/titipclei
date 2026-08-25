import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { paymentDestination } from "@/lib/payment-settings";
import { normalizeIndonesianPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { getProductImagesAdmin, PAYMENT_PROOFS_BUCKET } from "@/lib/storage/product-images";

const schema = z.object({ 
  productId: z.string().min(1), 
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(99), 
  customerName: z.string().trim().min(1), 
  customerPhone: z.string().trim().min(1), 
  customerEmail: z.string().trim().email().or(z.literal("")), 
  proofStorageKey: z.string().startsWith("orders/temp/"), 
  termsAccepted: z.literal(true) 
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const phone = normalizeIndonesianPhone(input.customerPhone);
    if (!phone) return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
    
    const proofPath = input.proofStorageKey.split("/");
    const proofFileName = proofPath.at(-1);
    const { data: proofFiles, error: proofError } = await getProductImagesAdmin().storage.from(PAYMENT_PROOFS_BUCKET).list("orders/temp", { search: proofFileName });
    if (proofError || !proofFiles?.some((file) => file.name === proofFileName)) return NextResponse.json({ error: "Bukti transfer belum selesai diupload. Silakan upload kembali." }, { status: 400 });
    
    const product = await prisma.product.findFirst({ where: { id: input.productId, status: { not: "CLOSED" } } });
    if (!product || Number(product.sellingPrice) <= 0) return NextResponse.json({ error: "Produk tidak tersedia untuk dipesan." }, { status: 400 });
    
    let unitPrice = Number(product.sellingPrice);
    let variantSnapshot = {};

    if (input.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: input.variantId },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } }
      });
      if (!variant || variant.productId !== product.id || variant.status === "INACTIVE") {
        return NextResponse.json({ error: "Varian produk tidak valid atau tidak tersedia." }, { status: 400 });
      }
      if (variant.stock < input.quantity) {
        return NextResponse.json({ error: "Stok varian tidak mencukupi." }, { status: 400 });
      }
      
      unitPrice += Number(variant.priceAdjustment);
      
      variantSnapshot = {
        variantId: variant.id,
        variantNameSnapshot: variant.name,
        selectedColor: variant.colorName,
        selectedSize: variant.size,
        selectedModel: variant.model,
        selectedImageSnapshot: variant.images.length > 0 ? variant.images[0].imageUrl : null,
        unitPriceSnapshot: unitPrice
      };
    }

    const total = unitPrice * input.quantity;
    const orderNumber = `JH-CN-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
    const createdAt = new Date();
    
    const order = await prisma.$transaction(async (tx) => {
      // Decrease stock if variant
      if (input.variantId) {
        await tx.productVariant.update({
          where: { id: input.variantId },
          data: { stock: { decrement: input.quantity } }
        });
      }

      const order = await tx.order.create({ 
        data: { 
          orderNumber, 
          productId: product.id, 
          productNameSnapshot: product.name, 
          ...variantSnapshot,
          unitPrice, 
          quantity: input.quantity, 
          customerName: input.customerName, 
          customerPhone: phone, 
          customerEmail: input.customerEmail || null, 
          termsAcceptedAt: createdAt, 
          subtotal: total, 
          total, 
          paymentStatus: "WAITING_VERIFICATION", 
          orderStatus: "WAITING_VERIFICATION" 
        } 
      });
      await tx.payment.create({ data: { orderId: order.id, amount: total, bankName: paymentDestination.bankName, destinationAccount: paymentDestination.accountNumber, accountHolder: paymentDestination.accountHolder, proofStorageKey: input.proofStorageKey, status: "WAITING_VERIFICATION", submittedAt: createdAt } });
      await tx.orderTracking.create({ data: { orderId: order.id, status: "WAITING_VERIFICATION", description: "Bukti pembayaran sedang menunggu verifikasi." } });
      return order;
    });
    revalidatePath("/admin/payments");
    revalidatePath("/admin/orders");
    return NextResponse.json({ success: true, order: { publicToken: order.publicToken, orderNumber: order.orderNumber, total: order.total } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pesanan gagal dikirim." }, { status: 400 });
  }
}
