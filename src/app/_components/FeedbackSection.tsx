'use client';

import type { EvaluationResult } from '@/lib/types/evaluation';

interface FeedbackSectionProps {
  scores: EvaluationResult['scores'];
  overallFeedback: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  specificity: '具体性',
  context: '前提情報',
  clarity: '目的の明確さ',
  answerability: '回答可能性',
};

export function FeedbackSection({ scores, overallFeedback }: FeedbackSectionProps) {
  const dimensions = ['specificity', 'context', 'clarity', 'answerability'] as const;
  const improvementItems = dimensions.filter((key) => scores[key].feedback);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-800">改善フィードバック</h3>

      <p className="text-sm text-slate-600">{overallFeedback}</p>

      {improvementItems.length > 0 ? (
        <ul className="space-y-2">
          {improvementItems.map((key) => (
            <li key={key} className="flex gap-2 text-sm">
              <span className="mt-0.5 text-amber-500">⚠</span>
              <span>
                <span className="font-medium text-slate-700">{DIMENSION_LABELS[key]}: </span>
                <span className="text-slate-600">{scores[key].feedback}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-green-600">✅ 全ての観点で良好です</p>
      )}

      {dimensions
        .filter((key) => !scores[key].feedback)
        .map((key) => (
          <div key={key} className="flex gap-2 text-sm text-green-600">
            <span>✅</span>
            <span>
              <span className="font-medium">{DIMENSION_LABELS[key]}: </span>良好
            </span>
          </div>
        ))}
    </div>
  );
}
