import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApplySafe - Scam & Job Fraud Detection Command Center",
  description: "Enterprise-grade AI cyber intelligence protecting candidates from fake jobs, recruiter phishing, and internship scams.",
};

import AuthGuard from "@/components/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-cyber-bg text-slate-100 selection:bg-cyber-cyan/30 selection:text-white">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
            <AuthGuard>
              {children}
            </AuthGuard>
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
