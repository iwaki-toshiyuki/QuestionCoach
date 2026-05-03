'use client';

import type { EvaluationResult } from '@/lib/types/evaluation';

interface ScoreDisplayProps {
  scores: EvaluationResult['scores'];
}

function scoreTheme(score: number) {
  if (score >= 90) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' };
  if (score >= 75) return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', bar: 'bg-indigo-500' };
  if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500' };
}

const DIMENSION_LABELS: Record<string, string> = {
  specificity: '具体性',
  context: '前提情報',
  clarity: '目的の明確さ',
  answerability: '回答可能性',
};

export function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const dimensions = ['specificity', 'context', 'clarity', 'answerability'] as const;
  const totalTheme = scoreTheme(scores.total);

  return (
    <div className="space-y-4">
      {/* 総合スコア */}
      <div className={`rounded-xl border p-6 ${totalTheme.bg} ${totalTheme.border}`}>
        <p className="text-sm font-medium text-slate-500 mb-1">総合スコア</p>
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-bold leading-none ${totalTheme.text}`}>{scores.total}</span>
          <span className="text-xl text-slate-400 mb-1">/ 100</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-white/70">
          <div
            className={`h-2 rounded-full transition-all ${totalTheme.bar}`}
            style={{ width: `${scores.total}%` }}
          />
        </div>
      </div>

      {/* 4観点スコア */}
      <div className="grid grid-cols-2 gap-3">
        {dimensions.map((key) => {
          const dim = scores[key];
          const theme = scoreTheme(dim.score);
          const isLow = dim.score < 50;
          return (
            <div
              key={key}
              className={`rounded-lg border p-4 bg-white ${isLow ? 'border-l-4 border-l-red-400 border-t border-r border-b border-slate-200' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{DIMENSION_LABELS[key]}</span>
                <span className={`text-lg font-bold ${theme.text}`}>{dim.score}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className={`h-1.5 rounded-full ${theme.bar}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{dim.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
