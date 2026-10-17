import type { Metadata } from "next";
import { NushushView } from "@/components/NushushView";

export const metadata: Metadata = { title: "Nushush — Bahasa Arab Bab 3" };

export default function NushushPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <NushushView />
    </main>
  );
}
