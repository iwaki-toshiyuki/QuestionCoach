'use client';

import { HIGH_QUALITY_SENTINEL } from '@/lib/types/evaluation';

interface BeforeAfterComparisonProps {
  originalQuestion: string;
  totalScore: number;
  rewrittenQuestion: string;
}

export function BeforeAfterComparison({
  originalQuestion,
  totalScore,
  rewrittenQuestion,
}: BeforeAfterComparisonProps) {
  const isHighQuality = rewrittenQuestion === HIGH_QUALITY_SENTINEL;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">Before / After 比較</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Before */}
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Before</span>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-sm font-bold text-slate-700">
              {totalScore}点
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{originalQuestion}</p>
        </div>

        {/* After */}
        <div className="rounded-xl border border-indigo-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">After</span>
          </div>
          {isHighQuality ? (
            <p className="text-sm text-green-700">✅ 十分良い質問です</p>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{rewrittenQuestion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
