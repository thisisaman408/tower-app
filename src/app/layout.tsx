import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Tower — Gemini-Vision Competitive Intelligence",
  description: "The autonomous market-intelligence analyst for founders. Drop competitors on a watchlist. Gemini Vision reads their pricing pages, careers, blog. Diff engine catches changes. Brief writer ships board memos.",
  keywords: ["competitive intelligence", "Gemini AI", "market analysis", "competitor tracking"],
  openGraph: {
    title: "Tower — Gemini-Vision Competitive Intelligence",
    description: "Watches competitors so founders don't have to. Gemini Vision reads pricing pages, careers, blog. Diff engine catches changes. Brief writer ships board memos.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[oklch(0.13_0_0)] text-[oklch(0.96_0_0)] antialiased" suppressHydrationWarning>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
