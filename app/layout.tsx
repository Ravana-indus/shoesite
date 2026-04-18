import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MaterialIconsScript } from "@/components/MaterialIconsScript";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "adidaslk.lk | Authentic Adidas in Sri Lanka",
  description: "Shop authentic Adidas shoes, apparel, and accessories in Sri Lanka. Premium sportswear, fast delivery, secure payment.",
  keywords: "Adidas, Sri Lanka, shoes, sportswear, running, training, football",
  openGraph: {
    title: "adidaslk.lk | Authentic Adidas in Sri Lanka",
    description: "Shop authentic Adidas shoes, apparel, and accessories in Sri Lanka.",
    type: "website",
    locale: "en_LK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${dmSans.variable} ${notoSerif.variable}`}>
      <body className="font-body antialiased">
        <MaterialIconsScript />
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
