
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Folders, Images, Inbox, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { Brand, Feedback } from "./AdminUI";

const items = [
  ["Overview", "/admin", LayoutDashboard],
  ["Enquiries", "/admin/enquiries", Inbox],
  ["Samples", "/admin/samples", Images],
  ["Categories", "/admin/categories", Folders],
  ["Services", "/admin/services", BriefcaseBusiness],
  ["Settings", "/admin/settings", Settings],
] as const;

export default function AdminNavigation({ owner }: { owner: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = items.find(([, href]) => href === pathname || (href !== "/admin" && pathname.startsWith(href + "/")));

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 960px)");
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error();
      dialog.current?.close();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
      setBusy(false);
    }
  }

  function navigation(mobile = false) {
    return (
      <div className="ad-nav-inner">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--ad-line)] px-4 py-3">
          <Link href="/admin" onClick={() => dialog.current?.close()}><Brand /></Link>
          {mobile && <button type="button" className="ad-button ad-icon-button" aria-label="Close menu" autoFocus onClick={() => dialog.current?.close()}><X aria-hidden="true" /></button>}
        </div>
        <nav aria-label="Owner navigation" className="grid gap-1 p-3">
          {items.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="ad-nav-link" aria-current={current?.[1] === href ? pathname === href ? "page" : "location" : undefined}
              onClick={() => { if (pathname === href) dialog.current?.close(); }}>
              <Icon aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-[var(--ad-line)] p-3">
          <p className="px-2 text-sm font-bold">{owner}</p>
          <p className="ad-muted px-2 pb-2 text-xs">Owner account</p>
          <Link href="/" className="ad-nav-link"><ArrowUpRight aria-hidden="true" /> View website</Link>
          <button type="button" onClick={logout} disabled={busy} className="ad-nav-link disabled:opacity-55"><LogOut aria-hidden="true" />{busy ? "Signing out…" : "Sign out"}</button>
          {error && <Feedback tone="error">{error}</Feedback>}
        </div>
      </div>
    );
  }

  return (
    <>
      <aside className="ad-sidebar">{navigation()}</aside>
      <header className="ad-mobile-header">
        <div className="min-w-0">
          <p className="ad-muted text-xs font-bold">Sharda Offset</p>
          <p className="text-sm font-extrabold">{current?.[0] ?? "Owner workspace"}</p>
        </div>
        <button type="button" className="ad-button ad-icon-button" aria-haspopup="dialog" aria-controls="owner-menu" aria-label="Open menu" onClick={() => dialog.current?.showModal()}><Menu aria-hidden="true" /></button>
      </header>
      <dialog id="owner-menu" ref={dialog} className="ad-drawer" aria-label="Owner menu" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        {navigation(true)}
      </dialog>
    </>
  );
}
