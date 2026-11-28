"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MagneticButton } from "./interactions/MagneticButton";
import { trackEvent } from "@/lib/analytics";
import Image from "next/image";

type NavbarProps = {
  businessName: string;
  logoUrl?: string | null;
  whatsapp: string;
  whatsappMessage: string;
  phonePrimary: string;
  quickChat: ReactNode;
};

export default function Navbar({
  businessName,
  logoUrl,
  whatsapp,
  whatsappMessage,
  phonePrimary,
  quickChat,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const syncLocation = () => {
      setHash(location.hash);
      setOpen(false);
    };
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    }
    const desktop = matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappUrl = `https://wa.me/${whatsapp.replace(
    /\D/g,
    "",
  )}?text=${encodeURIComponent(whatsappMessage)}`;

  const phoneUrl = `tel:${phonePrimary.replace(/\s/g, "")}`;

  const links = [
    ["Home", "/"],
    ["Services", "/#products"],
    ["Samples", "/samples"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];

  function currentLink(href: string) {
    if (href === "/#products") {
      return (pathname === "/" && hash === "#products") || pathname.startsWith("/services/") ? "location" : undefined;
    }
    if (href === "/") return pathname === "/" && hash !== "#products" ? "page" : undefined;
    if (pathname === href) return "page";
    return pathname.startsWith(`${href}/`) ? "location" : undefined;
  }

  function navigate(href: string) {
    setOpen(false);
    setHash(href === "/#products" ? "#products" : "");
  }

  return (
    <header
      className="catalogue-header sticky top-0 z-50"
      data-scrolled={scrolled ? "" : undefined}
    >
      <div className="container-shell flex min-h-16 items-center justify-between gap-3 sm:min-h-18 sm:gap-5">
        {/* Brand */}
        <Link
          href="/"
          className="focus-ring flex min-w-0 items-center gap-2 rounded-lg sm:gap-3"
          aria-label={`${businessName} home`}
          onNavigate={() => navigate("/")}
        >
          {logoUrl ? (
            <div className="relative h-10 w-24 shrink-0 sm:h-12 sm:w-36">
              <Image
                src={logoUrl}
                alt={`${businessName} logo`}
                fill
                sizes="(max-width: 640px) 96px, 144px"
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--maroon)] text-xs font-bold text-white sm:size-10 sm:text-sm">
              SO
            </span>
          )}

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight sm:text-base">
              {businessName}
            </span>

            <span className="hidden text-xs text-[var(--muted)] sm:block">
              Design · Printing · Process
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-5 text-sm lg:flex xl:gap-7"
          aria-label="Primary navigation"
        >
          {links.map(([label, href]) => (
            <Link
              key={label}
              className="nav-link focus-ring rounded-md text-[var(--muted)] transition hover:text-[var(--foreground)]"
              href={href}
              aria-current={currentLink(href)}
              onNavigate={() => navigate(href)}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/admin/login"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Owner Login
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            onClick={() =>
              trackEvent({
                event: "phone_click",
                metadata: { location: "navbar" },
              })
            }
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm lg:px-4"
            href={phoneUrl}
          >
            <Phone size={16} />
            Call
          </a>

          <a
            onClick={() =>
              trackEvent({
                event: "whatsapp_click",
                metadata: { location: "navbar" },
              })
            }
            className="premium-button focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--maroon)] px-3 py-2 text-sm font-medium text-white lg:px-4"
            href={whatsappUrl}
          >
            <MagneticButton><MessageCircle size={16} /> WhatsApp</MagneticButton>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:contents">
          {quickChat}
          <button
            ref={toggle}
            type="button"
            className="menu-toggle focus-ring shrink-0 rounded-lg lg:hidden"
            aria-controls="catalogue-mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div id="catalogue-mobile-nav" className="mobile-nav" data-open={open ? "" : undefined} inert={!open} aria-hidden={!open}>
        <div className="mobile-nav-body" data-native-scroll>
          <nav
            className="container-shell flex flex-col gap-0.5 py-3"
            aria-label="Mobile navigation"
          >
            {links.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                aria-current={currentLink(href)}
                onNavigate={() => navigate(href)}
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--background)]"
              >
                {label}
              </Link>
            ))}

            {/* Owner Login - now visible on mobile */}
            <Link
              href="/admin/login"
              onNavigate={() => setOpen(false)}
              className="mt-1 rounded-xl border-t border-[var(--border)] px-3 py-3 text-sm font-semibold text-[var(--maroon)] hover:bg-[var(--background)]"
            >
              Owner Login
            </Link>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                onClick={() =>
                  trackEvent({
                    event: "phone_click",
                    metadata: { location: "navbar_mobile" },
                  })
                }
                href={phoneUrl}
                className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-center text-sm font-semibold"
              >
                Call
              </a>

              <a
                onClick={() =>
                  trackEvent({
                    event: "whatsapp_click",
                    metadata: { location: "navbar_mobile" },
                  })
                }
                href={whatsappUrl}
                className="rounded-xl bg-[var(--maroon)] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                WhatsApp
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
