import { ArabicText } from '@/components/ArabicText';
import { splitArabicRuns } from '@/lib/text';

/** Teks Indonesia yang mengandung kata Arab: tiap potongan Arab dibungkus <ArabicText as="bdi">. */
export function MixedText({ text, showHarakat }: { text: string; showHarakat?: boolean }) {
  return (
    <>
      {splitArabicRuns(text).map((run, i) =>
        run.ar ? (
          <ArabicText key={i} as="bdi" showHarakat={showHarakat} className="text-[1.3em] leading-[1.9]">
            {run.text}
          </ArabicText>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  );
}
