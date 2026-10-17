'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { ProgressBar } from '@/components/ProgressBar';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { AUDIO_GROUPS, audioCatalog, extForMime, pickRecordingMime, type AudioGroup, type AudioItem } from '@/lib/audio';
import { content } from '@/lib/content';

const ITEMS = audioCatalog(content);
const MAX_SECONDS = 30;

type RecState = 'idle' | 'recording' | 'recorded';

const noopSubscribe = () => () => {};
const browserRecordingMime = () =>
  typeof MediaRecorder === 'undefined' ? null : pickRecordingMime((m) => MediaRecorder.isTypeSupported(m));

const btn =
  'rounded-full px-4 py-2 font-semibold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/** Halaman perekam guru (dev-only): rekam tiap teks, simpan langsung ke public/audio dengan nama yang benar. */
export function RecorderView() {
  const [files, setFiles] = useState<string[] | null>(null);
  const [group, setGroup] = useState<AudioGroup | 'semua'>('semua');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [currentKey, setCurrentKey] = useState(ITEMS[0].key);
  const [rec, setRec] = useState<RecState>('idle');
  const [take, setTake] = useState<{ blob: Blob; url: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  // Server: null (tidak ada MediaRecorder); browser: format yang didukung. Tanpa hydration mismatch.
  const mime = useSyncExternalStore(noopSubscribe, browserRecordingMime, () => null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  /** true selama menunggu izin mikrofon, supaya R yang ditekan dua kali tidak membuat dua perekam. */
  const startingRef = useRef(false);

  const fileFor = useCallback(
    (key: string) => files?.find((f) => f.slice(0, f.lastIndexOf('.')) === key) ?? null,
    [files],
  );

  const visible = useMemo(
    () => ITEMS.filter((i) => (group === 'semua' || i.group === group) && (!onlyMissing || !fileFor(i.key))),
    [group, onlyMissing, fileFor],
  );
  const current = ITEMS.find((i) => i.key === currentKey) ?? ITEMS[0];
  const savedFile = fileFor(current.key);
  const recordedCount = ITEMS.filter((i) => fileFor(i.key)).length;

  // Muat daftar file yang sudah ada.
  useEffect(() => {
    fetch('/api/audio')
      .then((r) => r.json())
      .then((d: { files?: string[]; error?: string }) => {
        if (d.files) setFiles(d.files);
        else setMessage({ text: d.error ?? 'Gagal memuat daftar rekaman.', error: true });
      })
      .catch(() => setMessage({ text: 'Gagal menghubungi server dev. Jalankan `npm run dev`.', error: true }));
  }, []);

  // Bersihkan mikrofon & URL sementara saat keluar halaman.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  useEffect(() => () => (take ? URL.revokeObjectURL(take.url) : undefined), [take]);

  const discardTake = useCallback(() => {
    setTake(null);
    setRec('idle');
  }, []);

  const select = useCallback(
    (key: string) => {
      if (rec === 'recording') return;
      discardTake();
      setCurrentKey(key);
      setMessage(null);
    },
    [rec, discardTake],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const list = visible.length ? visible : ITEMS;
      const i = list.findIndex((x) => x.key === currentKey);
      const next = list[Math.min(list.length - 1, Math.max(0, (i === -1 ? 0 : i) + dir))];
      if (next) select(next.key);
    },
    [visible, currentKey, select],
  );

  const startRecording = useCallback(async () => {
    if (!mime || startingRef.current || recorderRef.current?.state === 'recording') return;
    startingRef.current = true;
    setMessage(null);
    try {
      streamRef.current ??= await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setMessage({ text: 'Mikrofon tidak bisa dipakai. Izinkan akses mikrofon di browser lalu coba lagi.', error: true });
      return;
    } finally {
      startingRef.current = false;
    }
    const recorder = new MediaRecorder(streamRef.current, { mimeType: mime });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const blob = new Blob(chunks, { type: mime.split(';')[0] });
      setTake({ blob, url: URL.createObjectURL(blob) });
      setRec('recorded');
    };
    recorderRef.current = recorder;
    recorder.start();
    setTake(null);
    setRec('recording');
    timerRef.current = setTimeout(() => recorder.state === 'recording' && recorder.stop(), MAX_SECONDS * 1000);
  }, [mime]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    if (rec === 'recording') stopRecording();
    else void startRecording();
  }, [rec, startRecording, stopRecording]);

  const playTake = useCallback(() => {
    previewRef.current?.pause();
    const src = take ? take.url : savedFile ? `/audio/${savedFile}?v=${Date.now()}` : null;
    if (!src) return;
    const a = new Audio(src);
    previewRef.current = a;
    void a.play();
  }, [take, savedFile]);

  const save = useCallback(async () => {
    if (!take || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'content-type': take.blob.type, 'x-audio-key': current.key },
        body: take.blob,
      });
      const d = (await res.json()) as { file?: string; files?: string[]; error?: string };
      if (!res.ok || !d.files) throw new Error(d.error ?? `HTTP ${res.status}`);
      setFiles(d.files);
      setMessage({ text: `Tersimpan: public/audio/${d.file}` });
      discardTake();
      // Lanjut ke teks berikutnya yang belum direkam (di daftar yang sedang tampil).
      const list = visible.length ? visible : ITEMS;
      const i = list.findIndex((x) => x.key === current.key);
      const next = [...list.slice(i + 1), ...list.slice(0, i)].find((x) => !d.files!.some((f) => f.startsWith(`${x.key}.`)));
      if (next) setCurrentKey(next.key);
    } catch (e) {
      setMessage({ text: `Gagal menyimpan: ${(e as Error).message}`, error: true });
    } finally {
      setSaving(false);
    }
  }, [take, saving, current.key, discardTake, visible]);

  const remove = useCallback(async () => {
    if (!savedFile || !window.confirm(`Hapus rekaman ${savedFile}?`)) return;
    const res = await fetch(`/api/audio?key=${encodeURIComponent(current.key)}`, { method: 'DELETE' });
    const d = (await res.json()) as { files?: string[]; error?: string };
    if (d.files) {
      setFiles(d.files);
      setMessage({ text: `Dihapus: ${savedFile}` });
    } else setMessage({ text: d.error ?? 'Gagal menghapus.', error: true });
  }, [savedFile, current.key]);

  // Pintasan keyboard: R rekam/berhenti, P dengar, S simpan, ← → pindah teks.
  // (Enter sengaja tidak dipakai: Enter pada tombol yang sedang fokus, mis. "Buang", juga mengklik tombol itu.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === 'r') toggleRecording();
      else if (k === 'p') playTake();
      else if (k === 's' && take) void save();
      else if (k === 'arrowright') step(1);
      else if (k === 'arrowleft') step(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleRecording, playTake, save, step, take]);

  const ext = mime ? extForMime(mime.split(';')[0]) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">🎙️ Rekam Audio (khusus guru)</h1>
        <p className="text-muted">
          Halaman ini hanya ada saat <code>npm run dev</code> di komputer ini dan tidak ikut ke situs untuk murid. Rekaman
          disimpan ke <code>public/audio/</code>; setelah selesai jalankan <code>npm run build</code> lalu deploy ulang.
        </p>
        <ProgressBar value={files ? (recordedCount / ITEMS.length) * 100 : 0} label={`Sudah direkam ${recordedCount} dari ${ITEMS.length}`} />
      </div>

      {!mime && (
        <p role="alert" className="rounded-xl bg-red-600/10 p-3 text-sm">
          Browser ini tidak bisa merekam audio. Pakai Chrome, Edge, atau Safari versi terbaru.
        </p>
      )}
      {mime && ext !== 'm4a' && (
        <p className="rounded-xl bg-notice-bg p-3 text-sm text-notice-fg">
          Browser ini merekam dalam format .{ext}, yang mungkin tidak bisa diputar di sebagian iPhone. Kalau bisa, pakai
          Chrome/Edge versi terbaru atau Safari supaya hasilnya .m4a.
        </p>
      )}

      {/* Teks yang sedang direkam */}
      <section aria-labelledby="current-h" className="space-y-4 rounded-3xl border-2 border-primary/40 bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <h2 id="current-h" className="font-semibold">
            {AUDIO_GROUPS.find((g) => g.id === current.group)?.label} · {current.label}
          </h2>
          <span className={savedFile ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'text-muted'}>
            {savedFile ? `✓ Tersimpan (${savedFile.split('.').pop()})` : 'Belum direkam'}
          </span>
        </div>
        <ArabicText as="p" size="hero" className="text-center" showHarakat>
          {current.text}
        </ArabicText>
        <p className="text-center text-xs text-muted">
          File: public/audio/{current.key}.{ext ?? '…'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={!mime || saving}
            className={`${btn} ${rec === 'recording' ? 'animate-pulse bg-red-600 text-white' : 'bg-primary text-primary-foreground'}`}
          >
            {rec === 'recording' ? '⏹ Berhenti (R)' : '🎙️ Rekam (R)'}
          </button>
          <button
            type="button"
            onClick={playTake}
            disabled={rec === 'recording' || (!take && !savedFile)}
            className={`${btn} border border-border bg-surface`}
          >
            ▶ {take ? 'Dengar rekaman baru' : 'Dengar yang tersimpan'} (P)
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!take || saving}
            className={`${btn} bg-emerald-700 text-white`}
          >
            {saving ? 'Menyimpan…' : '💾 Simpan & lanjut (S)'}
          </button>
          {take && (
            <button type="button" onClick={discardTake} className={`${btn} border border-border bg-surface`}>
              Buang
            </button>
          )}
          {savedFile && !take && (
            <button type="button" onClick={() => void remove()} className={`${btn} border border-border bg-surface text-red-700 dark:text-red-300`}>
              🗑 Hapus
            </button>
          )}
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={() => step(-1)} className={`${btn} border border-border`}>
            ← Sebelumnya
          </button>
          <button type="button" onClick={() => step(1)} className={`${btn} border border-border`}>
            Berikutnya →
          </button>
        </div>
        {message && (
          <p role={message.error ? 'alert' : 'status'} className={`text-center text-sm ${message.error ? 'text-red-700 dark:text-red-300' : ''}`}>
            {message.text}
          </p>
        )}
        <p className="text-center text-xs text-muted">
          Tips: beri jeda ±0,5 detik sebelum & sesudah membaca, baca jelas dengan harakat lengkap. Maks. {MAX_SECONDS} detik.
        </p>
      </section>

      {/* Daftar semua teks */}
      <section aria-labelledby="list-h" className="space-y-3">
        <h2 id="list-h" className="text-lg font-bold">
          Daftar teks
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter kelompok"
            value={group}
            onChange={(e) => setGroup(e.target.value as AudioGroup | 'semua')}
            className="min-h-10 rounded-xl border border-border bg-surface px-3"
          >
            <option value="semua">Semua ({ITEMS.length})</option>
            {AUDIO_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label} ({ITEMS.filter((i) => i.group === g.id).length})
              </option>
            ))}
          </select>
          <ToggleSwitch label="Hanya yang belum" checked={onlyMissing} onChange={setOnlyMissing} />
        </div>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {visible.map((item: AudioItem) => {
            const saved = fileFor(item.key);
            const active = item.key === current.key;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => select(item.key)}
                  className={`flex w-full items-center gap-3 px-3 py-1 text-left focus-visible:outline-2 focus-visible:outline-primary ${active ? 'bg-primary/10' : ''}`}
                >
                  <span aria-label={saved ? 'sudah direkam' : 'belum direkam'} className="w-5 text-center">
                    {saved ? '✅' : '⬜'}
                  </span>
                  <span className="w-40 shrink-0 truncate text-sm text-muted">{item.label}</span>
                  <ArabicText className="flex-1 text-2xl" showHarakat>
                    {item.text}
                  </ArabicText>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
