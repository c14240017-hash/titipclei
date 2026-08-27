"use client";

import { useState } from "react";

export function AdminPaymentActions({ paymentId }: { paymentId: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const update = async (action: "verify" | "reject") => { setIsSaving(true); await fetch(`/api/admin/payments/${paymentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); window.location.reload(); };
  return <div className="flex justify-end gap-2"><button disabled={isSaving} onClick={() => update("reject")} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Tolak</button><button disabled={isSaving} onClick={() => update("verify")} className="rounded-lg bg-[#D98392] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#C86D7D] active:bg-[#B95F70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB5C0] focus-visible:ring-offset-2">Verifikasi</button></div>;
}
