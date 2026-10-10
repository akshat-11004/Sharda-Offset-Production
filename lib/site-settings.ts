import { prisma } from "@/lib/prisma";

const defaults = {
  businessName: "Sharda Offset",
  logoUrl: "",
  address:
    "5, Priti Complex, Santram Road, Opp. Riddhi Laboratory, Nadiad, Gujarat",
  phonePrimary: "+91 9825405898",
  phoneSecondary: "+91 8866600582",
  whatsapp: "+919825405898",
  email: "shardaoffset@gmail.com",
  hours: "9:00 AM – 7:30 PM",
  whatsappMessage:
    "Hello Sharda Offset, I would like to know more about your printing services.",
};

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findFirst();

  return settings ?? defaults;
}
