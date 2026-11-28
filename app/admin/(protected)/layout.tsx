
import AdminNavigation from "@/components/admin/AdminNavigation";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();

  return (
    <div className="ad-shell">
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10 ad-button">Skip to content</a>
      <AdminNavigation owner={owner.name} />
      <main id="admin-content" className="ad-main" tabIndex={-1}>{children}</main>
    </div>
  );
}
