import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { KeyboardShortcuts } from "@/components/admin/keyboard-shortcuts";
import { PullToRefresh } from "@/components/admin/pull-to-refresh";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/admin");
  }

  return (
    <div className="flex h-screen flex-col bg-muted lg:flex-row">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <KeyboardShortcuts />
      <PullToRefresh />
    </div>
  );
}
