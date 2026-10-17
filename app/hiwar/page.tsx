import type { Metadata } from "next";
import { HiwarView } from "@/components/HiwarView";

export const metadata: Metadata = { title: "Hiwar — Bahasa Arab Bab 3" };

export default function HiwarPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <HiwarView />
    </main>
  );
}
