"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clipboard, FileImage, Minus, Plus, Upload, X } from "lucide-react";
import { getProductImagesBrowserClient } from "@/lib/storage/product-images-client";

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  sellingPrice: number;
  status: string;
};
type Variant = {
  id: string;
  name: string | null;
  colorName: string | null;
  size: string | null;
  model: string | null;
  priceAdjustment: number;
  imageUrl: string | null;
};
type Destination = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};
const maxProofSize = 100 * 1024 * 1024;
const allowedProofTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const formatIdr = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export function CatalogOrderForm({
  product,
  paymentDestination,
  selectedVariant,
}: {
  product: Product;
  paymentDestination: Destination;
  selectedVariant?: Variant | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [proof, setProof] = useState<{
    key: string;
    preview: string;
    name: string;
    size: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const unitPrice = product.sellingPrice + (selectedVariant?.priceAdjustment || 0);
  const total = unitPrice * quantity;
  const displayImage = selectedVariant?.imageUrl || product.imageUrl;
  
  const variantDescription = [selectedVariant?.colorName, selectedVariant?.size, selectedVariant?.model, selectedVariant?.name].filter(Boolean).join(" · ");

  async function uploadProof(file: File) {
    setError("");
    if (!allowedProofTypes.has(file.type))
      return setError("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
    if (file.size > maxProofSize)
      return setError("Ukuran bukti transfer maksimal 100 MB.");
    setUploading(true);
    setPendingFile(file);
    try {
      const response = await fetch("/api/orders/proof/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: file.type, fileSize: file.size }),
      });
      const signed = await response.json();
      if (!response.ok)
        throw new Error(
          signed.error || "Gagal menyiapkan upload bukti transfer.",
        );
      const { error: uploadError } = await getProductImagesBrowserClient()
        .storage.from(signed.bucket)
        .uploadToSignedUrl(signed.key, signed.token, file, {
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      setProof({
        key: signed.key,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });
      setPendingFile(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Gagal mengupload bukti transfer. Silakan coba lagi.",
      );
    } finally {
      setUploading(false);
    }
  }

  function selectProof(file: File | undefined) {
    if (file) void uploadProof(file);
  }
  function removeProof() {
    if (proof?.preview) URL.revokeObjectURL(proof.preview);
    setProof(null);
    setPendingFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }
  async function copyAccount() {
    await navigator.clipboard.writeText(paymentDestination.accountNumber);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!termsAccepted)
      return setError(
        "Kamu harus menyetujui Syarat & Ketentuan sebelum melanjutkan.",
      );
    if (!proof) return setError("Upload bukti transfer terlebih dahulu.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id,
          quantity,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          recipientName: recipientName || name,
          recipientPhone: recipientPhone || phone,
          addressLine,
          city,
          province,
          postalCode,
          shippingNote,
          proofStorageKey: proof.key,
          termsAccepted: true,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Pesanan gagal dikirim.");
      router.push(`/order/success/${result.order.publicToken}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Pesanan gagal dikirim.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] py-8 pb-28 lg:pb-8">
      <form onSubmit={submit} className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-wider text-[#5B3DF5]">
          Pesanan katalog
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#0F1B38]">
          Konfirmasi Pesanan
        </h1>
        <p className="mt-2 text-slate-600">
          Lengkapi data pemesan dan unggah bukti transfer untuk melanjutkan.
        </p>
        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#E6E8F0] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F1B38]">Data Pemesan</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Nama Lengkap
                  <input
                    required
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (!recipientName) setRecipientName(event.target.value);
                    }}
                    className="field mt-2"
                    placeholder="Nama lengkap"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Nomor WhatsApp
                  <input
                    required
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      if (!recipientPhone) setRecipientPhone(event.target.value);
                    }}
                    className="field mt-2"
                    inputMode="tel"
                    placeholder="08xxxxxxxxxx"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Email{" "}
                  <span className="font-normal text-slate-400">(opsional)</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="field mt-2"
                    type="email"
                    placeholder="email@example.com"
                  />
                </label>
              </div>
            </section>
            <section className="rounded-2xl border border-[#E8D8D1] bg-[#FFFDFC] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#4B342F]">Alamat Pengiriman</h2>
              <p className="mt-1 text-sm text-[#8B716A]">Gunakan alamat lengkap agar pesanan dapat dikirim dengan tepat.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#5E4039]">Nama Penerima<input required value={recipientName} onChange={(event) => setRecipientName(event.target.value)} onFocus={() => !recipientName && setRecipientName(name)} className="field mt-2" placeholder="Sama dengan nama pemesan" /></label>
                <label className="text-sm font-semibold text-[#5E4039]">WhatsApp Penerima<input required value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} onFocus={() => !recipientPhone && setRecipientPhone(phone)} className="field mt-2" inputMode="tel" placeholder="Sama dengan WhatsApp pemesan" /></label>
                <label className="text-sm font-semibold text-[#5E4039] sm:col-span-2">Alamat Lengkap<textarea required value={addressLine} onChange={(event) => setAddressLine(event.target.value)} className="field mt-2 min-h-24" placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, dll." /></label>
                <label className="text-sm font-semibold text-[#5E4039]">Kota / Kabupaten<input required value={city} onChange={(event) => setCity(event.target.value)} className="field mt-2" /></label>
                <label className="text-sm font-semibold text-[#5E4039]">Provinsi<input required value={province} onChange={(event) => setProvince(event.target.value)} className="field mt-2" /></label>
                <label className="text-sm font-semibold text-[#5E4039]">Kode Pos<input required value={postalCode} onChange={(event) => setPostalCode(event.target.value)} className="field mt-2" inputMode="numeric" /></label>
                <label className="text-sm font-semibold text-[#5E4039]">Catatan Pengiriman <span className="font-normal text-[#8B716A]">(opsional)</span><input value={shippingNote} onChange={(event) => setShippingNote(event.target.value)} className="field mt-2" placeholder="Rumah pagar putih, titip satpam." /></label>
              </div>
            </section>
            <section className="rounded-2xl border border-[#E6E8F0] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F1B38]">Pembayaran</h2>
              <p className="mt-1 text-sm text-slate-500">
                Metode pembayaran: Transfer Bank
              </p>
              <dl className="mt-5 grid gap-4 rounded-xl bg-[#F7F8FC] p-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Bank</dt>
                  <dd className="mt-1 font-bold text-[#0F1B38]">
                    {paymentDestination.bankName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Nomor Rekening</dt>
                  <dd className="mt-1 flex items-center gap-2 font-bold text-[#0F1B38]">
                    <span>{paymentDestination.accountNumber}</span>
                    <button
                      type="button"
                      onClick={copyAccount}
                      title="Salin nomor rekening"
                      className="text-[#5B3DF5]"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Atas Nama</dt>
                  <dd className="mt-1 font-bold text-[#0F1B38]">
                    {paymentDestination.accountHolder}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 rounded-xl bg-[#0F1B38] p-5 text-white">
                <p className="text-sm text-slate-300">
                  Total yang Harus Ditransfer
                </p>
                <p className="mt-1 text-3xl font-extrabold">
                  {formatIdr(total)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Transfer sesuai nominal di atas agar pembayaran lebih mudah
                  diverifikasi.
                </p>
              </div>
            </section>
            <section className="rounded-2xl border border-[#E6E8F0] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F1B38]">
                Bukti Transfer <span className="text-rose-600">*</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                JPG, PNG, WEBP • maksimal 100 MB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => selectProof(event.target.files?.[0])}
              />
              {proof ? (
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <img
                    src={proof.preview}
                    alt="Pratinjau bukti transfer"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-slate-600">
                      {proof.name} · {(proof.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-lg border px-3 py-2 font-semibold"
                      >
                        Ganti Bukti
                      </button>
                      <button
                        type="button"
                        onClick={removeProof}
                        className="rounded-lg border border-rose-200 px-3 py-2 font-semibold text-rose-600"
                      >
                        Hapus
                      </button>
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                  onDrop={(event) => {
                    event.preventDefault();
                    selectProof(event.dataTransfer.files[0]);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E6E8F0] bg-[#F7F8FC] p-5 text-center transition hover:border-violet-300 disabled:opacity-60"
                >
                  <Upload className="h-7 w-7 text-[#5B3DF5]" />
                  <span className="mt-2 font-semibold text-slate-700">
                    {uploading ? "Mengupload..." : "Upload Bukti Transfer"}
                  </span>
                  <span className="mt-1 text-sm text-slate-500">
                    Klik atau tarik gambar ke sini
                  </span>
                </button>
              )}
              {uploading && pendingFile && (
                <p className="mt-3 text-sm text-[#5B3DF5]">
                  Mengupload {pendingFile.name}...
                </p>
              )}
            </section>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E6E8F0] bg-white p-4 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#5B3DF5]"
              />
              <span>
                Saya telah membaca dan menyetujui{" "}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="font-semibold text-[#5B3DF5] underline"
                >
                  Syarat & Ketentuan JastipHub
                </button>
                .
              </span>
            </label>
            {error && (
              <p className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}
          </div>
          <aside className="order-first lg:order-last">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F1B38]">
                Ringkasan Pesanan
              </h2>
              <div className="mt-5 flex gap-3">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-xl bg-[#F1EEFF] text-[#5B3DF5]">
                    <FileImage className="h-6 w-6" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-[#0F1B38]">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {product.brand || product.category}
                  </p>
                  {variantDescription && (
                    <p className="mt-1 text-xs font-semibold text-slate-600 bg-slate-100 w-fit px-2 py-0.5 rounded-full">
                      {variantDescription}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-y border-slate-100 py-4">
                <span className="text-sm text-slate-600">Jumlah</span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg border"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    aria-label="Jumlah produk"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Math.min(
                          99,
                          Math.max(1, Number(event.target.value) || 1),
                        ),
                      )
                    }
                    className="h-8 w-10 rounded-lg border text-center text-sm"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.min(99, value + 1))
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg border"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </span>
              </div>
              <div className="space-y-3 pt-4 text-sm">
                <p className="flex justify-between text-slate-600">
                  <span>Harga Satuan</span>
                  <strong className="text-[#0F1B38]">
                    {formatIdr(unitPrice)}
                  </strong>
                </p>
                <p className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <strong className="text-[#0F1B38]">{formatIdr(total)}</strong>
                </p>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">Total Pembayaran</p>
                <p className="mt-1 text-2xl font-extrabold text-[#0F1B38]">
                  {formatIdr(total)}
                </p>
              </div>
              <button
                disabled={submitting || uploading}
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#5B3DF5] px-4 text-center text-sm font-semibold text-white hover:bg-[#4930D8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Mengirim Pesanan..."
                  : "Kirim Pesanan & Bukti Pembayaran"}
              </button>
            </div>
          </aside>
        </div>
      </form>
      {termsOpen && <TermsDialog onClose={() => setTermsOpen(false)} />}
    </main>
  );
}

const terms = [
  [
    "1. Harga Produk",
    "Harga yang tercantum pada halaman produk adalah harga jual yang berlaku pada saat pesanan dibuat. Harga dapat berubah untuk pesanan baru apabila terjadi perubahan harga barang, kurs, biaya pengiriman, atau biaya lainnya. Pesanan yang sudah dibuat menggunakan harga yang tercatat pada saat transaksi tersebut dibuat.",
  ],
  [
    "2. Pembayaran",
    "Pembayaran dilakukan melalui transfer ke rekening yang tercantum pada halaman pembayaran. Customer wajib melakukan transfer sesuai nominal yang tertera. Pesanan hanya akan diproses setelah bukti transfer dikirim dan pembayaran berhasil diverifikasi.",
  ],
  [
    "3. Verifikasi Pembayaran",
    "Bukti transfer akan diperiksa sebelum pesanan diproses. Jika bukti transfer tidak valid, tidak terbaca, atau nominal pembayaran tidak sesuai, pembayaran dapat ditolak dan customer akan diminta mengirim bukti pembayaran kembali.",
  ],
  [
    "4. Pembelian Barang",
    "Barang akan dibeli setelah pembayaran berhasil diverifikasi. Ketersediaan barang dapat berubah sewaktu-waktu. Jika barang ternyata tidak tersedia, customer akan dihubungi untuk menentukan penyelesaian yang sesuai.",
  ],
  [
    "5. Variant dan Detail Produk",
    "Customer bertanggung jawab memastikan variant, ukuran, warna, jumlah, atau informasi produk yang dipilih sudah benar sebelum mengirim pesanan. Jika ada pilihan variant, data yang tersimpan pada pesanan menjadi acuan pembelian.",
  ],
  [
    "6. Pengecekan Barang",
    "Barang yang diterima akan melalui pengecekan kondisi secara sederhana sebelum dikirim ke customer. Pengecekan ini bukan pemeriksaan profesional, autentikasi produk, atau pemeriksaan kualitas produksi secara menyeluruh.",
  ],
  [
    "7. Pengiriman",
    "Estimasi pengiriman hanya merupakan perkiraan dan dapat berubah akibat proses logistik, bea cukai, cuaca, hari libur, atau faktor lain di luar kendali jasa titip. Status pesanan akan diperbarui selama proses berlangsung.",
  ],
  [
    "8. Kerusakan atau Masalah Produk",
    "Kerusakan atau cacat yang berasal dari produsen, seller, atau proses pengiriman dari seller akan ditangani berdasarkan kondisi dan kebijakan seller jika memungkinkan. JastipHub tidak menjamin bahwa seluruh komplain kepada seller dapat diterima.",
  ],
  [
    "9. Pembatalan Pesanan",
    "Pesanan yang belum dibelikan dapat diajukan untuk pembatalan dan akan ditinjau terlebih dahulu. Pesanan yang barangnya sudah dibeli tidak dapat dibatalkan secara sepihak kecuali terdapat kondisi khusus.",
  ],
  [
    "10. Refund",
    "Refund hanya dilakukan apabila terdapat alasan yang dapat diterima, misalnya barang tidak tersedia dan pembelian tidak dapat dilanjutkan. Biaya yang telah terpakai atau tidak dapat dikembalikan oleh pihak terkait dapat diperhitungkan dalam proses refund.",
  ],
  [
    "11. Data Customer",
    "Nama, nomor WhatsApp, email, alamat, dan data pembayaran digunakan hanya untuk memproses pesanan, komunikasi, dan pengiriman. Bukti pembayaran tidak boleh ditampilkan secara publik.",
  ],
  [
    "12. Persetujuan",
    "Dengan mencentang persetujuan Syarat & Ketentuan dan mengirim pesanan, customer dianggap telah memahami dan menyetujui ketentuan yang berlaku.",
  ],
];
function TermsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
    >
      <section className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#5B3DF5]">
              JastipHub
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#0F1B38]">
              Syarat & Ketentuan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-5 text-sm leading-6 text-slate-600">
          {terms.map(([title, content]) => (
            <section key={title}>
              <h3 className="font-bold text-[#0F1B38]">{title}</h3>
              <p className="mt-1">{content}</p>
            </section>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#5B3DF5] py-3 font-semibold text-white"
        >
          Saya Mengerti
        </button>
      </section>
    </div>
  );
}
