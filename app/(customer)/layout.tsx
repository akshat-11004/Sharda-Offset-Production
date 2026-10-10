import { PageViewTracker } from "@/components/customer/PageViewTracker";
import Navbar from "@/components/customer/Navbar";
import { WhatsAppFab } from "@/components/customer/WhatsAppFab";
import { getSiteSettings } from "@/lib/site-settings";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
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
      />
      {children}
      <WhatsAppFab
        businessName={settings.businessName}
        whatsapp={settings.whatsapp}
        whatsappMessage={
          settings.whatsappMessage ||
          "Hello, I would like to enquire about printing."
        }
      />
    </>
  );
}
