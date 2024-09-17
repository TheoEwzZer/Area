import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReactNode, ReactElement } from "react";
import Navbar from "@/components/navbar";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
