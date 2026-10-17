'use client';

import { useEffect, useRef } from 'react';

/** Handler panah: kembalikan true kalau sudah ditangani (mis. pindah kartu). */
export type ArrowHandler = (dir: 1 | -1) => boolean;

const handlers: { current: ArrowHandler }[] = [];

/** Daftarkan handler panah halaman (dipakai Mode Kelas). Handler terakhir yang terdaftar menang. */
export function useArrowHandler(handler: ArrowHandler, active = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!active) return;
    handlers.push(ref);
    return () => {
      const i = handlers.lastIndexOf(ref);
      if (i !== -1) handlers.splice(i, 1);
    };
  }, [active]);
}

export function dispatchArrow(dir: 1 | -1): boolean {
  const top = handlers[handlers.length - 1];
  return top ? top.current(dir) : false;
}
