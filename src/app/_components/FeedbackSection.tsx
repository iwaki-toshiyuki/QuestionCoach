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
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-800">改善フィードバック</h3>

      {/* 総合サマリー */}
      <p className="text-sm text-gray-700">{overallFeedback}</p>

      {/* 観点別フィードバック */}
      {improvementItems.length > 0 ? (
        <ul className="space-y-2">
          {improvementItems.map((key) => (
            <li key={key} className="flex gap-2 text-sm">
              <span className="mt-0.5 text-yellow-500">⚠</span>
              <span>
                <span className="font-medium text-gray-700">{DIMENSION_LABELS[key]}: </span>
                <span className="text-gray-600">{scores[key].feedback}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-green-600">✅ 全ての観点で良好です</p>
      )}

      {/* 良好な観点 */}
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
