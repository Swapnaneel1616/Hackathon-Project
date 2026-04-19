import { DemoControlDock } from "@/components/demo-control-dock";
import { UserNav } from "@/components/user/user-nav";
import { RequireUser } from "@/components/user/require-user";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-36">
      <UserNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <RequireUser>{children}</RequireUser>
      </main>
      <DemoControlDock />
    </div>
  );
}
