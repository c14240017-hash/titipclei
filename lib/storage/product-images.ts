import { createClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGES_BUCKET = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
export const PAYMENT_PROOFS_BUCKET = "payment-proofs";
export const MAX_PRODUCT_IMAGE_SIZE = 100 * 1024 * 1024;
export const MAX_PAYMENT_PROOF_SIZE = 100 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Konfigurasi ${name} belum tersedia.`);
  return value;
}

export function getProductImagesAdmin() {
  return createClient(requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"), requiredEnvironment("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function validateProductImage(file: { mimeType: string; fileSize: number }) {
  if (!PRODUCT_IMAGE_TYPES.has(file.mimeType)) throw new Error("Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau AVIF.");
  if (!Number.isFinite(file.fileSize) || file.fileSize <= 0 || file.fileSize > MAX_PRODUCT_IMAGE_SIZE) throw new Error("Ukuran gambar maksimal 100 MB.");
}

export function productImageKey(mimeType: string, productId?: string) {
  const extension = PRODUCT_IMAGE_TYPES.get(mimeType);
  if (!extension) throw new Error("Format file tidak didukung.");
  return `products/${productId || "temp"}/${crypto.randomUUID()}.${extension}`;
}

export function paymentProofKey(mimeType: string) {
  const extension = PRODUCT_IMAGE_TYPES.get(mimeType);
  if (!extension || mimeType === "image/avif") throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  return `orders/temp/${crypto.randomUUID()}.${extension}`;
}

export function storageKeyFromProductImageUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    return index >= 0 ? decodeURIComponent(parsed.pathname.slice(index + marker.length)) : null;
  } catch {
    return null;
  }
}

export async function deleteStoredProductImage(url: string | null | undefined) {
  const key = storageKeyFromProductImageUrl(url);
  if (!key) return;
  const { error } = await getProductImagesAdmin().storage.from(PRODUCT_IMAGES_BUCKET).remove([key]);
  if (error) console.warn("Product image cleanup failed", { key, message: error.message });
}
