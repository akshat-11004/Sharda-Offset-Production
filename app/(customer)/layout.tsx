import { PageViewTracker } from "@/components/customer/PageViewTracker";
import Navbar from "@/components/customer/Navbar";
import { WhatsAppFab } from "@/components/customer/WhatsAppFab";
import { getSiteSettings } from "@/lib/site-settings";
import { CustomerMotion } from "@/components/customer/motion/CustomerMotion";
import "./interactions.css";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <CustomerMotion>
      <PageViewTracker />
      <Navbar
        businessName={settings.businessName}
        logoUrl={settings.logoUrl}
        whatsapp={settings.whatsapp}
        whatsappMessage={
          settings.whatsappMessage ||
          "Hello, I would like to enquire about printing."
        }
        phonePrimary={settings.phonePrimary}
        quickChat={
          <WhatsAppFab
            businessName={settings.businessName}
            whatsapp={settings.whatsapp}
            whatsappMessage={settings.whatsappMessage || "Hello, I would like to enquire about printing."}
          />
        }
      />
      <div className="customer-page">{children}</div>
    </CustomerMotion>
  );
}
