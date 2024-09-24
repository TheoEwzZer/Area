import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import SupabaseProvider from "@/providers/supabase-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import localFont from "next/font/local";
import { ReactElement, ReactNode } from "react";
import "./globals.css";

const geistSans: NextFontWithVariable = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono: NextFontWithVariable = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Area",
  description: "Automatisation Platform",
};

function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <ClerkProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
          <SupabaseProvider>
            <Navbar />
            {children}
          </SupabaseProvider>
          <Toaster />
        </body>
      </ClerkProvider>
    </html>
  );
}

export default RootLayout;
