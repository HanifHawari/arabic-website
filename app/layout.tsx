import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic, Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { BetaBanner } from "@/components/BetaBanner";
import { ClassModeController } from "@/components/ClassModeController";
import { SiteHeader } from "@/components/SiteHeader";
import { content } from "@/lib/content";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Judul (Latin) bergaya serif; teks Arab tetap pakai Noto Naskh Arabic.
const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
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
    { media: "(prefers-color-scheme: light)", color: "#f9faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1916" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // UI utama Bahasa Indonesia (LTR); blok Arab diatur per elemen lewat <ArabicText>.
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${notoSerif.variable} ${notoNaskh.variable} h-full antialiased`}
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
        <footer className="hide-in-class px-4 pb-8 print:hidden">
          <div className="mx-auto flex max-w-5xl gap-3 rounded-2xl border border-border bg-surface-alt p-4 text-xs leading-relaxed text-muted">
            <span aria-hidden="true" className="text-lg leading-none">
              📚
            </span>
            <div>
              <p className="font-semibold text-foreground">Materi: {content.meta.source}.</p>
              <p className="mt-1">
                Teks bacaan, dialog, dan soal di situs ini adalah buatan sendiri (bukan salinan buku). Ilustrasi: emoji &
                ikon SVG buatan sendiri.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
