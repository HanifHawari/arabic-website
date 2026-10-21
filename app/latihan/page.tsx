import type { Metadata } from "next";
import { LatihanView } from "@/components/LatihanView";

export const metadata: Metadata = { title: "Latihan — Bahasa Arab Bab 3" };

export default function LatihanPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 sm:py-8">
      <LatihanView />
    </main>
  );
}
