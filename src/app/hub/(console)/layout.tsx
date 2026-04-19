import { HubNav } from "@/components/hub/hub-nav";
import { RequireHub } from "@/components/hub/require-hub";

export default function HubConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireHub>
      <div className="pb-16">
        <HubNav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </RequireHub>
  );
}
