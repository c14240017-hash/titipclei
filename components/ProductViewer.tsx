"use client";

import { useState } from "react";
import Link from "next/link";
import { Package2, ChevronLeft, ChevronRight } from "lucide-react";

type VariantData = {
  id: string;
  name: string | null;
  colorName: string | null;
  colorHex: string | null;
  size: string | null;
  model: string | null;
  stock: number;
  priceAdjustment: number;
  images: { imageUrl: string; isPrimary: boolean }[];
};

type ProductData = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  sellingPrice: number;
  imageUrl: string | null;
  images: string[];
  category: { name: string } | null;
  variants: VariantData[];
};

export function ProductViewer({ product }: { product: ProductData }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || null;

  // Decide current price
  const currentPrice = Number(product.sellingPrice) + (selectedVariant ? Number(selectedVariant.priceAdjustment) : 0);

  // Decide main image
  const gallery = selectedVariant?.images.length ? selectedVariant.images.map((image) => image.imageUrl) : (product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : []);
  const mainImage = gallery[imageIndex] || gallery[0] || null;
  const moveImage = (direction: number) => setImageIndex((current) => gallery.length ? (current + direction + gallery.length) % gallery.length : 0);

  // Derive unique options
  const colors = Array.from(new Map(product.variants.filter((v) => v.colorName).map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex }])).values());
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  const models = Array.from(new Set(product.variants.map((v) => v.model).filter(Boolean)));

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // When options change, try to match a variant
  const handleSelect = (type: "color" | "size" | "model", val: string) => {
    const newColor = type === "color" ? val : selectedColor;
    const newSize = type === "size" ? val : selectedSize;
    const newModel = type === "model" ? val : selectedModel;
    
    if (type === "color") setSelectedColor(val);
    if (type === "size") setSelectedSize(val);
    if (type === "model") setSelectedModel(val);

    const matchingVariant = product.variants.find(
      (v) =>
        (newColor ? v.colorName === newColor : true) &&
        (newSize ? v.size === newSize : true) &&
        (newModel ? v.model === newModel : true)
    );

    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
    } else {
      setSelectedVariantId(null);
    }
  };

  const isStockEmpty = selectedVariant ? selectedVariant.stock <= 0 : false;
  
  // URL to order page: pass variantId as query param if selected
  const orderUrl = selectedVariantId ? `/order/${product.slug}?variant=${selectedVariantId}` : `/order/${product.slug}`;

  // If variants exist but none selected, should we disable?
  const hasVariants = product.variants.length > 0;
  const isOrderDisabled = isStockEmpty || (hasVariants && !selectedVariantId);

  return (
    <div className="grid lg:grid-cols-2">
      <section className="flex min-h-[400px] flex-col items-center justify-center bg-[#F7EFE8] p-6 lg:min-h-full">
        {mainImage ? (
          <div className="relative w-full" onTouchStart={(event) => { (event.currentTarget as HTMLElement).dataset.startX = String(event.touches[0].clientX); }} onTouchEnd={(event) => { const start = Number((event.currentTarget as HTMLElement).dataset.startX); if (Math.abs(event.changedTouches[0].clientX - start) > 40) moveImage(event.changedTouches[0].clientX < start ? 1 : -1); }}><img src={mainImage} alt={`${product.name} foto ${imageIndex + 1}`} className="h-[360px] w-full rounded-2xl object-contain" />{gallery.length > 1 && <><button aria-label="Foto sebelumnya" onClick={() => moveImage(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#6F4A45] shadow"><ChevronLeft /></button><button aria-label="Foto berikutnya" onClick={() => moveImage(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#6F4A45] shadow"><ChevronRight /></button></>}</div>
        ) : (
          <Package2 className="h-24 w-24 text-violet-300" />
        )}
        {gallery.length > 1 && (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto">
            {gallery.map((url, idx) => (
              <button key={url} onClick={() => setImageIndex(idx)} className={`shrink-0 rounded-lg border-2 ${idx === imageIndex ? "border-[#D98C97]" : "border-white"}`}><img src={url} alt={`Pilih foto ${idx + 1}`} className="h-16 w-16 rounded-md object-cover" /></button>
            ))}
          </div>
        )}
      </section>

      <section className="p-7 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-wider text-[#5B3DF5]">
          {product.category?.name ?? "Produk"}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-[#0F1B38]">{product.name}</h1>
        {product.brand && <p className="mt-2 text-slate-500">{product.brand}</p>}

        <p className="mt-6 leading-7 text-slate-600 whitespace-pre-wrap">
          {product.description || "Detail produk akan diinformasikan oleh admin."}
        </p>

        {/* Variants Selection */}
        {hasVariants && (
          <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
            {colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700">Warna</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect("color", c.name as string)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selectedColor === c.name
                          ? "border-[#5B3DF5] bg-violet-50 text-[#5B3DF5]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {c.hex && (
                        <span
                          className="h-4 w-4 rounded-full border border-slate-200"
                          style={{ backgroundColor: c.hex }}
                        />
                      )}
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700">Ukuran</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect("size", s as string)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        selectedSize === s
                          ? "border-[#5B3DF5] bg-violet-50 text-[#5B3DF5]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {models.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700">Model</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {models.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect("model", m as string)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        selectedModel === m
                          ? "border-[#5B3DF5] bg-violet-50 text-[#5B3DF5]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 border-y border-slate-100 py-5 flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">Harga</p>
            <p className="mt-1 text-3xl font-extrabold text-[#0F1B38]">
              Rp {currentPrice.toLocaleString("id-ID")}
            </p>
          </div>
          {selectedVariant && (
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">Sisa Stok: {selectedVariant.stock}</p>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-col space-y-3">
          {hasVariants && !selectedVariantId && (
            <p className="text-sm text-amber-600 font-medium">Pilih varian terlebih dahulu untuk memesan.</p>
          )}
          {isStockEmpty && (
            <p className="text-sm text-red-600 font-medium">Varian ini sedang habis.</p>
          )}
          <Link
            href={isOrderDisabled ? "#" : orderUrl}
            className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition ${
              isOrderDisabled
                ? "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                : "bg-[#5B3DF5] text-white hover:bg-violet-700 shadow-md shadow-violet-200"
            }`}
          >
            Ajukan Pesanan
          </Link>
        </div>
      </section>
    </div>
  );
}
