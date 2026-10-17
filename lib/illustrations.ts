// Ilustrasi kosakata: emoji (dekoratif) atau ikon SVG buatan sendiri (components/Illustration.tsx).
// Tidak memakai gambar dari buku.

export type SvgIcon = 'blackboard' | 'desk' | 'sharpener' | 'pencilCase' | 'eraser' | 'rug';

export type IllustrationSpec = { kind: 'emoji'; value: string } | { kind: 'svg'; value: SvgIcon };

const e = (value: string): IllustrationSpec => ({ kind: 'emoji', value });
const s = (value: SvgIcon): IllustrationSpec => ({ kind: 'svg', value });

const MAP: Record<string, IllustrationSpec> = {
  haqibah: e('🎒'),
  miqlamah: s('pencilCase'),
  qalam: e('🖊️'),
  mirsam: e('✏️'),
  qalam_rashash: e('✏️'),
  misthorah: e('📏'),
  mibroh: s('sharpener'),
  firjar: e('📐'),
  qirthas: e('📄'),
  mimsahah: s('eraser'),
  miqash: e('✂️'),
  hibr: e('🖋️'),
  ghilaf: e('📔'),
  daftar: e('📓'),
  kitab: e('📕'),
  fashl: e('🏫'),
  jidar: e('🧱'),
  bab: e('🚪'),
  miftah: e('🔑'),
  mishbah: e('💡'),
  mukayyif: e('❄️'),
  brojektor: e('📽️'),
  jaras: e('🔔'),
  sabburah: s('blackboard'),
  massahah: e('🧽'),
  thabsyurah: e('🖍️'),
  maktab: s('desk'),
  saah_yadawiyyah: e('⌚'),
  kursi: e('🪑'),
  raff: e('📚'),
  marodh: e('🗄️'),
  bithoqoh: e('🪪'),
  khorithoh: e('🗺️'),
  mujam: e('📖'),
  mausuah: e('📚'),
  shurah: e('🖼️'),
  mulshaq: e('🧴'),
  taqwim: e('📅'),
  bisath: s('rug'),
  kasyful_hudhur: e('📋'),
  majallah_haithiyyah: e('📰'),
  jadwal_durus: e('🗓️'),
  kurah_ardhiyyah: e('🌍'),
  nafidzah: e('🪟'),
  saah_haithiyyah: e('🕰️'),
};

export const FALLBACK_ILLUSTRATION: IllustrationSpec = e('📘');

export const illustrationFor = (vocabId: string): IllustrationSpec => MAP[vocabId] ?? FALLBACK_ILLUSTRATION;

export const hasIllustration = (vocabId: string): boolean => vocabId in MAP;
