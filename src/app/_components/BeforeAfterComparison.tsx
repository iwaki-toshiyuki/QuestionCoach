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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Before */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">Before</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm font-bold text-gray-700">
            {totalScore}点
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-gray-800">{originalQuestion}</p>
      </div>

      {/* After */}
      <div className="rounded-xl border border-blue-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-600">After</span>
        </div>
        {isHighQuality ? (
          <p className="text-sm text-green-700">✅ 十分良い質問です</p>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-gray-800">{rewrittenQuestion}</p>
        )}
      </div>
    </div>
  );
}
