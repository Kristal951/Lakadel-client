import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Lora, Archivo_Black, Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Providers from "@/contexts/Providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "Lakadel",
  description: "Shop Lakadel, shop elegance",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Lakadel.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} ${bebas.variable} font-sans antialiased`}
      >
        <Analytics/>
        <SpeedInsights/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
