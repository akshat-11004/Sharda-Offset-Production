"use client";

import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type WhatsAppFabProps = {
  businessName: string;
  whatsapp: string;
  whatsappMessage: string;
};

export function WhatsAppFab({
  businessName,
  whatsapp,
  whatsappMessage,
}: WhatsAppFabProps) {
  const href = `https://wa.me/${whatsapp.replace(
    /\D/g,
    "",
  )}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      onClick={() =>
        trackEvent({
          event: "whatsapp_click",
          metadata: { location: "floating_button" },
        })
      }
      href={href}
      aria-label={`Chat with ${businessName}`}
      className="fixed bottom-20 right-4 z-40 grid size-14 place-items-center rounded-full border border-white/20 bg-[var(--maroon)] text-white shadow-[0_14px_35px_rgba(109,36,48,.35)] transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-5"
    >
      <MessageCircle />
    </a>
  );
}
