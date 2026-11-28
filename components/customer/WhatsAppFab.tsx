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
      className="catalogue-fab focus-ring z-40 grid size-11 place-items-center rounded-full border border-white/20 bg-[var(--maroon)] text-white shadow-[0_10px_24px_rgba(109,36,48,.25)] lg:fixed lg:size-14"
    >
      <MessageCircle />
    </a>
  );
}
