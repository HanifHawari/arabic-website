import { ArabicText } from '@/components/ArabicText';
import { MixedText } from '@/components/MixedText';
import { correctAnswerText, type Question } from '@/lib/quiz';

export function QuizFeedback({ question, correct }: { question: Question; correct: boolean }) {
  const right = correctAnswerText(question);
  return (
    <div
      role="status"
      className={`space-y-2 rounded-3xl border-2 p-4 ${correct ? 'border-emerald-600 bg-emerald-600/10' : 'border-red-600 bg-red-600/10'}`}
    >
      <p className="font-display text-lg font-bold">{correct ? '✅ Benar! Mantap.' : '❌ Belum tepat.'}</p>
      {!correct && question.kind !== 'match' && (
        <p>
          Jawaban benar:{' '}
          {right.ar ? (
            <ArabicText as="bdi" className="text-2xl" showHarakat>
              {right.text}
            </ArabicText>
          ) : (
            <strong>{right.text}</strong>
          )}
        </p>
      )}
      <p className="text-sm">
        <MixedText text={question.explanation} showHarakat />
      </p>
    </div>
  );
}
