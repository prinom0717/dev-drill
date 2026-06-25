import type { Metadata } from "next";
import Link from "next/link";
import HeaderClient from "./_components/header-client";
import { NavigationLoading } from "./_components/navigation-loading";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import Registry from "./registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "問題演習アプリ",
    template: "%s | 問題演習アプリ",
  },
  description: "資格試験の選択問題を章別・ランダムで解ける学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col touch-manipulation bg-[radial-gradient(circle_at_20%_0%,rgba(234,88,12,0.16),transparent_28%),radial-gradient(circle_at_100%_20%,rgba(15,23,42,0.08),transparent_20%),linear-gradient(180deg,#fff8ef_0%,#fffdf9_36%,#f4f1ea_100%)] text-slate-900 flex flex-col">
        <NavigationLoading />
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 pr-3 font-semibold tracking-tight text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3h8A2.5 2.5 0 0 1 19 5.5v13A1.5 1.5 0 0 0 17.5 17H8.5A2.5 2.5 0 0 1 6 14.5z" />
                  <path d="M8.5 5h7.75" />
                  <path d="M8.5 8h7.75" />
                  <path d="M8.5 11h5.75" />
                </svg>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm uppercase tracking-[0.24em] text-slate-400">問題演習</span>
                <span className="text-base">学習アプリ</span>
              </span>
            </Link>
            <div className="flex flex-1 items-center justify-end">
              <HeaderClient />
            </div>
          </div>
        </header>
        <Registry>{children}</Registry>
      </body>
    </html>
  );
}
