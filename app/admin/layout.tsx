import { AdminShell } from "@/components/AdminShell";
import { Toaster } from "@/components/ui/toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Toaster><AdminShell>{children}</AdminShell></Toaster>;
}
