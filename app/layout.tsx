import type { Metadata, Viewport } from "next";
import { Geist, Noto_Naskh_Arabic } from "next/font/google";
import { BetaBanner } from "@/components/BetaBanner";
import { ClassModeController } from "@/components/ClassModeController";
import { SiteHeader } from "@/components/SiteHeader";
import { content } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `Bahasa Arab Bab 3 — ${content.meta.title_id}`,
  description: `Belajar interaktif Bab 3 Bahasa Arab MTs Kelas VII: ${content.meta.title_id}.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#12110f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // UI utama Bahasa Indonesia (LTR); blok Arab diatur per elemen lewat <ArabicText>.
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${notoNaskh.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main"
          className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Lompat ke isi
        </a>
        <BetaBanner />
        <SiteHeader />
        {children}
        <ClassModeController />
        <footer className="hide-in-class border-t border-border px-4 py-6 text-center text-xs text-muted print:hidden">
          <p>Materi: {content.meta.source}.</p>
          <p className="mt-1">
            Teks bacaan, dialog, dan soal di situs ini adalah buatan sendiri (bukan salinan buku). Ilustrasi: emoji & ikon SVG
            buatan sendiri.
          </p>
        </footer>
      </body>
    </html>
  );
}
