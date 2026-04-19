import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ReliefProvider } from "@/context/relief-context";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ReliefGrid — Preparedness-to-Response Food Hub",
  description:
    "Pre-disaster warehouse reservations, donor tickets, and shelter-spoke coordination for equitable food access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full`}>
      <body className={`${dmSans.className} min-h-full antialiased`}>
        <ReliefProvider>{children}</ReliefProvider>
      </body>
    </html>
  );
}
