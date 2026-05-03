'use client';

import type { EvaluationResult } from '@/lib/types/evaluation';

interface ScoreDisplayProps {
  scores: EvaluationResult['scores'];
}

function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function scoreBarColor(score: number): string {
  if (score >= 90) return 'bg-green-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

const DIMENSION_LABELS: Record<string, string> = {
  specificity: '具体性',
  context: '前提情報',
  clarity: '目的の明確さ',
  answerability: '回答可能性',
};

export function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const dimensions = ['specificity', 'context', 'clarity', 'answerability'] as const;

  return (
    <div className="space-y-4">
      {/* 総合スコア */}
      <div className={`rounded-xl border p-4 ${scoreColor(scores.total)}`}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">総合スコア</span>
          <span className="text-3xl font-bold">{scores.total} / 100</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-white/50">
          <div
            className={`h-3 rounded-full transition-all ${scoreBarColor(scores.total)}`}
            style={{ width: `${scores.total}%` }}
          />
        </div>
      </div>

      {/* 4観点スコア */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dimensions.map((key) => {
          const dim = scores[key];
          return (
            <div key={key} className={`rounded-lg border p-3 ${scoreColor(dim.score)}`}>
              <div className="text-xs font-medium">{DIMENSION_LABELS[key]}</div>
              <div className="mt-1 text-2xl font-bold">{dim.score}</div>
              <div className="mt-1 text-xs opacity-80">{dim.reason}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
