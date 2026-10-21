import type { Metadata } from "next";
import { MufradatView } from "@/components/MufradatView";

export const metadata: Metadata = { title: "Mufradat — Bahasa Arab Bab 3" };

export default function MufradatPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:py-8">
      <MufradatView />
    </main>
  );
}
