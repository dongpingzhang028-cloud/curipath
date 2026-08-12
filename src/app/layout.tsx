import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavBar } from "@/components/NavBar";
import { FeedbackButton } from "@/components/FeedbackButton";

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
  // Canonical host, so relative Open Graph/Twitter image URLs resolve against
  // www rather than the apex domain that redirects to it.
  metadataBase: new URL("https://www.curipath.com"),
  title: "CuriPath — Discover Kids Classes and Free Trials",
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
          <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
              <div>
                <p className="font-display text-base font-bold text-slate-900">🧭 CuriPath</p>
                <p className="mt-1">Discover and book classes kids love.</p>
              </div>
              <nav className="flex gap-4">
                <Link href="/explore" className="hover:text-indigo-600">
                  Explore Programs
                </Link>
                <Link href="/dashboard" className="hover:text-indigo-600">
                  My Dashboard
                </Link>
                <Link href="/privacy" className="hover:text-indigo-600">
                  Privacy Policy
                </Link>
                <FeedbackButton />
              </nav>
              <p>© {new Date().getFullYear()} CuriPath. All rights reserved.</p>
            </div>
          </footer>
        </Providers>
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-85DNM8L5QV" />
    </html>
  );
}
