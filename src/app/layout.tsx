import type { Metadata } from "next";
import { Inter, Playfair_Display, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "USDC Rails - Instant Global Payments on Arc",
  description: "Cross-border payments, payroll, and trade finance powered by USDC on Circle's Arc L1. Real-time settlement. Minimal fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${syne.variable} bg-background`}
    >
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
