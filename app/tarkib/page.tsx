import type { Metadata } from "next";
import { TarkibView } from "@/components/TarkibView";

export const metadata: Metadata = { title: "Tarkib — Bahasa Arab Bab 3" };

export default function TarkibPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <TarkibView />
    </main>
  );
}
