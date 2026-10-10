"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
} from "lucide-react";

const items = [
  ["Admin Home", "/admin", LayoutDashboard],
  ["Enquiries", "/admin/enquiries", Inbox],
  ["Samples", "/admin/samples", ImageIcon],
  ["Categories", "/admin/categories", ImageIcon],
  ["Services", "/admin/services", BriefcaseBusiness],
  ["Settings", "/admin/settings", Settings],
] as const;

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <aside className="w-full shrink-0 border-b border-black/10 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between border-b border-black/10 p-5">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Store className="h-5 w-5" />
          Sharda Offset
        </Link>
      </div>

      <nav className="grid gap-1 p-3 sm:grid-cols-2 md:block">
        {items.map(([label, href, Icon]) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                active
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#403a35] hover:bg-[#f6f1e9]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-1 border-t border-black/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[#f6f1e9]"
        >
          <ArrowLeft className="h-4 w-4" />
          View website
        </Link>

        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
