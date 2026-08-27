"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

type RequestDeleteProps = {
  id: string;
  requestNumber: string;
  customerName: string | null;
  productName: string;
  detail?: boolean;
};

export function AdminRequestDeleteButton({ id, requestNumber, customerName, productName, detail = false }: RequestDeleteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function remove() {
    setDeleting(true);
    setMessage("");
    const response = await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setDeleting(false);
    if (!response.ok) {
      const error = data?.error || "Gagal menghapus request. Silakan coba lagi.";
      setMessage(error);
      toast.add({ title: "Gagal menghapus request", description: error, type: "error" });
      return;
    }
    setOpen(false);
    window.dispatchEvent(new Event("admin:requests-changed"));
    if (detail) {
      router.push("/admin/requests?deleted=1");
      router.refresh();
      return;
    }
    setMessage("Request berhasil dihapus.");
    toast.add({ title: "Request berhasil dihapus.", type: "success" });
    router.refresh();
  }

  return <div className={detail ? "mt-4" : "inline-block"}>
    <button type="button" onClick={() => { setMessage(""); setOpen(true); }} title="Hapus Request" aria-label={`Hapus request ${requestNumber}`} className={detail ? "inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50" : "inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"}>
      <Trash2 className="h-4 w-4" aria-hidden="true" />{detail ? "Hapus Request" : "Hapus"}
    </button>
    {message && <p role="status" className="mt-2 text-sm text-rose-700">{message}</p>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={!deleting} className="p-6">
        <DialogHeader><DialogTitle>Hapus Request Barang?</DialogTitle><DialogDescription>Request ini akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader>
        <div className="rounded-xl bg-[#FFF9F5] p-4 text-sm text-[#4B342F]"><p className="font-semibold">{requestNumber}</p><p className="mt-1">{customerName || "Pelanggan"}</p><p className="mt-1 text-[#8B716A]">{productName}</p></div>
        <DialogFooter><button type="button" disabled={deleting} onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Batal</button><button type="button" disabled={deleting} onClick={remove} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? "Menghapus..." : "Hapus Request"}</button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
