"use client";

import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { getProductImagesBrowserClient } from "@/lib/storage/product-images-client";

export type VariantData = {
  id: string; // temp ID for UI
  name: string;
  colorName: string;
  colorHex: string;
  size: string;
  model: string;
  stock: string;
  priceAdjustment: string;
  images: string[];
};

export function ProductVariantManager({
  variants,
  onChange,
  productId,
}: {
  variants: VariantData[];
  onChange: (variants: VariantData[]) => void;
  productId?: string;
}) {
  const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);
  
  const addVariant = () => {
    onChange([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: "",
        colorName: "",
        colorHex: "",
        size: "",
        model: "",
        stock: "0",
        priceAdjustment: "0",
        images: [],
      },
    ]);
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof VariantData, value: any) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const uploadImageForVariant = async (variantId: string, file: File) => {
    setUploadingVariantId(variantId);
    try {
      const sign = await fetch("/api/admin/product-images/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          productId: productId, // Might be undefined if creating new
        }),
      });
      const signed = await sign.json();
      if (!sign.ok) throw new Error(signed?.error || "Gagal menyiapkan upload gambar.");

      const { error: uploadError } = await getProductImagesBrowserClient()
        .storage.from(signed.bucket)
        .uploadToSignedUrl(signed.key, signed.token, file, {
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Add image to variant
      const variant = variants.find((v) => v.id === variantId);
      if (variant) {
        updateVariant(variantId, "images", [...variant.images, signed.url]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal upload gambar.");
    } finally {
      setUploadingVariantId(null);
    }
  };

  const removeImageFromVariant = (variantId: string, imageIndex: number) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      const newImages = [...variant.images];
      newImages.splice(imageIndex, 1);
      updateVariant(variantId, "images", newImages);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white p-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Varian Produk</h2>
          <p className="text-sm text-slate-500">Warna, ukuran, atau model (opsional).</p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <Plus className="h-4 w-4" /> Tambah Varian
        </button>
      </div>

      {variants.length > 0 && (
        <div className="space-y-6 mt-4">
          {variants.map((variant, idx) => (
            <div key={variant.id} className="relative rounded-xl border border-slate-200 p-5 bg-slate-50/50">
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="text-slate-400 hover:text-red-600"
                  title="Hapus Varian"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <h3 className="font-bold text-slate-700 mb-4">Varian {idx + 1}</h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Nama Varian (opsional)
                  <input
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                    className="field mt-2 w-full"
                    placeholder="Contoh: Biru M"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Warna
                  <input
                    value={variant.colorName}
                    onChange={(e) => updateVariant(variant.id, "colorName", e.target.value)}
                    className="field mt-2 w-full"
                    placeholder="Contoh: Biru"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Hex Warna
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={variant.colorHex || "#ffffff"}
                      onChange={(e) => updateVariant(variant.id, "colorHex", e.target.value)}
                      className="h-10 w-10 shrink-0 cursor-pointer rounded border bg-white p-1"
                    />
                    <input
                      value={variant.colorHex}
                      onChange={(e) => updateVariant(variant.id, "colorHex", e.target.value)}
                      className="field w-full"
                      placeholder="#3B82F6"
                    />
                  </div>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Ukuran
                  <input
                    value={variant.size}
                    onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                    className="field mt-2 w-full"
                    placeholder="Contoh: M"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Model
                  <input
                    value={variant.model}
                    onChange={(e) => updateVariant(variant.id, "model", e.target.value)}
                    className="field mt-2 w-full"
                    placeholder="Contoh: Oversize"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Stok
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.id, "stock", e.target.value)}
                    className="field mt-2 w-full"
                    min="0"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Penyesuaian Harga (Rp)
                  <input
                    type="number"
                    value={variant.priceAdjustment}
                    onChange={(e) => updateVariant(variant.id, "priceAdjustment", e.target.value)}
                    className="field mt-2 w-full"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500 font-normal mt-1">Ditambahkan ke Harga Beli dasar</p>
                </label>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Gambar Varian</p>
                <div className="flex flex-wrap gap-3">
                  {variant.images.map((img, imgIdx) => (
                    <div key={imgIdx} className="relative h-24 w-24 rounded-lg border bg-white overflow-hidden">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageFromVariant(variant.id, imgIdx)}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white hover:border-indigo-400">
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImageForVariant(variant.id, file);
                      }}
                    />
                    {uploadingVariantId === variant.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-slate-400" />
                        <span className="mt-1 text-[10px] font-semibold text-slate-500">Upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
