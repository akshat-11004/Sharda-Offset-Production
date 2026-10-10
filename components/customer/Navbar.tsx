"use client";

import Link from "next/link";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import Image from "next/image";

type NavbarProps = {
  businessName: string;
  logoUrl?: string | null;
  whatsapp: string;
  whatsappMessage: string;
  phonePrimary: string;
};

export default function Navbar({
  businessName,
  logoUrl,
  whatsapp,
  whatsappMessage,
  phonePrimary,
}: NavbarProps) {
  const [open, setOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${whatsapp.replace(
    /\D/g,
    "",
  )}?text=${encodeURIComponent(whatsappMessage)}`;

  const phoneUrl = `tel:${phonePrimary.replace(/\s/g, "")}`;

  const links = [
    ["Home", "/"],
    ["Services", "/#services"],
    ["Samples", "/samples"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(247,243,236,.94)] backdrop-blur">
      <div className="container-shell flex min-h-16 items-center justify-between gap-3 sm:min-h-18 sm:gap-5">
        {/* Brand */}
        <Link
          href="/"
          className="focus-ring flex min-w-0 items-center gap-2 rounded-lg sm:gap-3"
          aria-label={`${businessName} home`}
          onClick={() => setOpen(false)}
        >
          {logoUrl ? (
            <div className="relative h-10 w-24 shrink-0 sm:h-12 sm:w-36">
              <Image
                src={logoUrl}
                alt={`${businessName} logo`}
                fill
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
              Print • Design • Create
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-5 text-sm md:flex lg:gap-7"
          aria-label="Primary navigation"
        >
          {links.map(([label, href]) => (
            <Link
              key={label}
              className="focus-ring rounded-md text-[var(--muted)] transition hover:text-[var(--foreground)]"
              href={href}
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
        <div className="hidden items-center gap-2 sm:flex">
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
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--maroon)] px-3 py-2 text-sm font-medium text-white lg:px-4"
            href={whatsappUrl}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="focus-ring shrink-0 rounded-lg p-2 md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          <nav
            className="container-shell flex flex-col gap-0.5 py-3"
            aria-label="Mobile navigation"
          >
            {links.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[var(--background)]"
              >
                {label}
              </Link>
            ))}

            {/* Owner Login - now visible on mobile */}
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
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
      )}
    </header>
  );
}
