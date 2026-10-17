import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const BASE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    // Static export: tanpa backend, deploy sebagai file statis (PRD §7).
    // Saat `next dev` tidak dipasang supaya API simpan rekaman (POST, dev-only) bisa jalan;
    // batasan static export tetap dicek oleh `next build`.
    // cacheComponents/partialPrefetching bawaan create-next-app dimatikan: PPR tidak bisa di export mode.
    output: isDev ? undefined : "export",
    // File *.dev.tsx / *.dev.ts (halaman /rekam + API simpan rekaman guru) hanya ada saat `next dev`,
    // tidak ikut build produksi.
    pageExtensions: isDev ? [...BASE_EXTENSIONS.map((e) => `dev.${e}`), ...BASE_EXTENSIONS] : BASE_EXTENSIONS,
    // Jangan biarkan `next dev` menulis blok instruksi ke AGENTS.md proyek.
    agentRules: false,
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
