import AdminNavigation from "@/components/admin/AdminNavigation";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();

  return (
    <div className="min-h-screen bg-[#fbf8f3] md:flex">
      <AdminNavigation />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
