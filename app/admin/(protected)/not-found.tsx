
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/AdminUI";

export default function AdminNotFound() {
  return (
    <div className="ad-page">
      <PageHeader title="Record not found" />
      <div className="ad-card"><EmptyState action={<Link className="ad-button" href="/admin">Go to overview</Link>}>This record may have been removed.</EmptyState></div>
    </div>
  );
}
