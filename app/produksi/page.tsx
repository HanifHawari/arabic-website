import type { Metadata } from "next";
import { ProduksiView } from "@/components/ProduksiView";

export const metadata: Metadata = { title: "Produksi Teks — Bahasa Arab Bab 3" };

export default function ProduksiPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 sm:py-8">
      <ProduksiView />
    </main>
  );
}
