import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Precura — Pharmacogenomic Clinical Decision Interface",
  description:
    "A prototype decision interface demonstrating how pharmacogenomic and biomarker signals change treatment suitability. MIT GrandHack research demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-[#0a0a0f] text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
