import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";
import "./site.css";
import "./commerce.css";
import "./checkout.css";
import "./operations.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Adetech Solar | Powering life, every day",
    template: "%s | Adetech Solar",
  },
  description:
    "Shop genuine solar panels, inverters, batteries and complete power systems. Expert installation and support across Nigeria.",
  openGraph: {
    title: "Adetech Solar | Powering life, every day",
    description:
      "Reliable solar products and expert installation, delivered across Nigeria.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
