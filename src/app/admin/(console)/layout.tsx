import { AdminNav } from "@/components/admin/admin-nav";
import { RequireAdmin } from "@/components/admin/require-admin";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-16">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <RequireAdmin>{children}</RequireAdmin>
      </main>
    </div>
  );
}
