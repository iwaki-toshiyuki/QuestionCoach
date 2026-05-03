import { describe, it, expect } from 'vitest';
import { calcTotal } from '@/lib/services/EvaluationService';
import type { EvaluationResult } from '@/lib/types/evaluation';

function makeScores(
  specificity: number,
  context: number,
  clarity: number,
  answerability: number,
): EvaluationResult['scores'] {
  const dim = (score: number) => ({ score, reason: '', feedback: '' });
  return {
    specificity: dim(specificity),
    context: dim(context),
    clarity: dim(clarity),
    answerability: dim(answerability),
    total: 0,
  };
}

describe('calcTotal', () => {
  it('4観点スコアの平均が正しく計算される', () => {
    expect(calcTotal(makeScores(60, 80, 70, 90))).toBe(75);
  });

  it('小数点以下が Math.round で丸められる', () => {
    // (60 + 70 + 80 + 75) / 4 = 71.25 → 71
    expect(calcTotal(makeScores(60, 70, 80, 75))).toBe(71);
    // (60 + 70 + 80 + 77) / 4 = 71.75 → 72
    expect(calcTotal(makeScores(60, 70, 80, 77))).toBe(72);
  });
});
