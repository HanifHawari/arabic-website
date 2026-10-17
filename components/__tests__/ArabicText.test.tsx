import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArabicText } from '@/components/ArabicText';

describe('ArabicText', () => {
  it('selalu set dir="rtl" dan lang="ar"', () => {
    const html = renderToStaticMarkup(<ArabicText>كِتَابٌ</ArabicText>);
    expect(html).toBe('<span dir="rtl" lang="ar" class="font-arabic">كِتَابٌ</span>');
  });

  it('bisa ganti elemen dan ukuran', () => {
    const html = renderToStaticMarkup(
      <ArabicText as="bdi" size="word" className="font-bold">
        قَلَمٌ
      </ArabicText>,
    );
    expect(html).toBe('<bdi dir="rtl" lang="ar" class="font-arabic text-arabic-word font-bold">قَلَمٌ</bdi>');
  });

  it('showHarakat=false menampilkan teks tanpa harakat', () => {
    const html = renderToStaticMarkup(<ArabicText showHarakat={false}>حَقِيْبَةٌ</ArabicText>);
    expect(html).toContain('>حقيبة<');
  });
});
