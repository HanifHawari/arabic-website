import type { Metadata } from "next";
import { IstimaView } from "@/components/IstimaView";

export const metadata: Metadata = { title: "Istima' — Bahasa Arab Bab 3" };

export default function IstimaPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 sm:py-8">
      <IstimaView />
    </main>
  );
}
