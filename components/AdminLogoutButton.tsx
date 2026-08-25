"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="inline-flex items-center gap-2 rounded-xl border border-[#D8B5A4] bg-[#FFFDFC] px-3 py-2 text-sm font-semibold text-[#5E4039] hover:bg-[#F8E8EB]"><LogOut className="h-4 w-4" />Keluar</button>;
}
