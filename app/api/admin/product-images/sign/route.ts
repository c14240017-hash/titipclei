import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin";
import { getProductImagesAdmin, PRODUCT_IMAGES_BUCKET, productImageKey, validateProductImage } from "@/lib/storage/product-images";

const schema = z.object({ fileName: z.string().min(1).max(255), mimeType: z.string(), fileSize: z.number().int(), productId: z.string().optional() });

export async function POST(request: Request) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  try {
    const input = schema.parse(await request.json());
    validateProductImage(input);
    const key = productImageKey(input.mimeType, input.productId);
    const storage = getProductImagesAdmin().storage.from(PRODUCT_IMAGES_BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(key);
    if (error || !data) {
      const storageMessage = error?.message.toLowerCase() || "";
      if (storageMessage.includes("bucket not found") || storageMessage.includes("related resource does not exist")) throw new Error(`Bucket Supabase \"${PRODUCT_IMAGES_BUCKET}\" belum dibuat atau nama bucket di .env tidak sama.`);
      throw new Error(error?.message || "Gagal membuat sesi upload gambar.");
    }
    const { data: publicUrl } = storage.getPublicUrl(key);
    return NextResponse.json({ key, token: data.token, url: publicUrl.publicUrl, bucket: PRODUCT_IMAGES_BUCKET });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyiapkan upload gambar.";
    if (process.env.NODE_ENV === "development") console.error("PRODUCT IMAGE SIGN FAILED", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
