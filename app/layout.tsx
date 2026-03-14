import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { PatientProvider } from "@/context/PatientContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-[#0a0a0f] text-white`}>
        <PatientProvider>
          <Navbar />
          {children}
        </PatientProvider>
      </body>
    </html>
  );
}