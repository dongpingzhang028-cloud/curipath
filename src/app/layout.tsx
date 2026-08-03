import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuriPath — Find and Book Kids' Classes",
  description: "Browse and book art, sports, music, coding, and more classes for kids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Providers>
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
            CuriPath — find and book classes kids love.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
