import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Veritas Grove University ERP — Student Lifecycle Management",
  description: "Unified Student Lifecycle Management & Alumni Automation System. From admission to alumni, one connected platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-200">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
