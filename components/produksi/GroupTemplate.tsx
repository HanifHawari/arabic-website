'use client';

import { useState } from 'react';

interface Row {
  nama: string;
  tugas: string;
  kalimat: string;
  koreksi: string;
}

const emptyRow = (): Row => ({ nama: '', tugas: '', kalimat: '', koreksi: '' });
const cell = 'w-full rounded-md border border-border bg-surface px-2 py-1 print:border-0 print:p-0';

/** Template produksi berkelompok (F8): bisa diisi lalu dicetak / disimpan PDF lewat dialog print. */
export function GroupTemplate() {
  const [group, setGroup] = useState('');
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: 5 }, emptyRow));
  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-4">
      <p className="print:hidden">
        Kelompok 4–5 orang. Tiap anggota menulis 1–2 kalimat dengan kata kunci berbeda, lalu saling mengoreksi (tashih) dan
        menggabungkannya jadi satu paragraf. Isi tabel di bawah, lalu cetak atau simpan sebagai PDF.
      </p>
      <div className="print-area space-y-3">
        <h2 className="hidden text-lg font-bold print:block">Produksi Teks Berkelompok — Bab 3 Peralatan Sekolah</h2>
        <label className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Nama kelompok:</span>
          <input value={group} onChange={(e) => setGroup(e.target.value)} className={`${cell} max-w-xs flex-1`} />
        </label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm print:min-w-0">
            <thead>
              <tr>
                {['No', 'Nama', 'Tugas / kata kunci', 'Kalimat (Arab)', 'Koreksi'].map((h) => (
                  <th key={h} scope="col" className="border border-border bg-background px-2 py-1 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="border border-border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border border-border p-1">
                    <input aria-label={`Nama anggota ${i + 1}`} value={r.nama} onChange={(e) => update(i, { nama: e.target.value })} className={cell} />
                  </td>
                  <td className="border border-border p-1">
                    <input aria-label={`Tugas anggota ${i + 1}`} value={r.tugas} onChange={(e) => update(i, { tugas: e.target.value })} className={cell} />
                  </td>
                  <td className="border border-border p-1">
                    <textarea
                      aria-label={`Kalimat Arab anggota ${i + 1}`}
                      dir="rtl"
                      lang="ar"
                      rows={2}
                      value={r.kalimat}
                      onChange={(e) => update(i, { kalimat: e.target.value })}
                      className={`${cell} font-arabic text-xl leading-loose`}
                    />
                  </td>
                  <td className="border border-border p-1">
                    <textarea
                      aria-label={`Koreksi untuk anggota ${i + 1}`}
                      rows={2}
                      value={r.koreksi}
                      onChange={(e) => update(i, { koreksi: e.target.value })}
                      className={cell}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, emptyRow()])}
          className="rounded-full border border-border bg-surface px-4 py-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          + Tambah baris
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          🖨️ Cetak / simpan PDF
        </button>
      </div>
    </div>
  );
}
