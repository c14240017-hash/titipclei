import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductImagesAdmin, MAX_PAYMENT_PROOF_SIZE, PAYMENT_PROOFS_BUCKET, paymentProofKey, validateProductImage } from "@/lib/storage/product-images";

const schema = z.object({ mimeType: z.string(), fileSize: z.number().int() });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    validateProductImage(input);
    if (input.mimeType === "image/avif") throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
    if (input.fileSize > MAX_PAYMENT_PROOF_SIZE) throw new Error("Ukuran bukti transfer maksimal 100 MB.");
    const key = paymentProofKey(input.mimeType);
    const { data, error } = await getProductImagesAdmin().storage.from(PAYMENT_PROOFS_BUCKET).createSignedUploadUrl(key);
    if (error || !data) throw new Error(error?.message || "Gagal menyiapkan upload bukti transfer.");
    return NextResponse.json({ bucket: PAYMENT_PROOFS_BUCKET, key, token: data.token });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyiapkan upload bukti transfer." }, { status: 400 });
  }
}
