import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharda Offset | Premium Printing Studio",
  description: "A premium local printing studio for invitations, business stationery, signage and custom print solutions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
