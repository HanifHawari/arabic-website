import type { Metadata } from "next";
import { RecorderView } from "@/components/rekam/RecorderView";

// Halaman khusus guru — hanya ada saat `next dev` (ekstensi .dev.tsx, lihat next.config.ts).
export const metadata: Metadata = {
  title: "Rekam Audio (guru) — Bahasa Arab Bab 3",
  robots: { index: false, follow: false },
};

export default function RekamPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <RecorderView />
    </main>
  );
}
