'use client';

import { useState } from 'react';
import { HIGH_QUALITY_SENTINEL } from '@/lib/types/evaluation';

interface RewriteSectionProps {
  rewrittenQuestion: string;
}

export function RewriteSection({ rewrittenQuestion }: RewriteSectionProps) {
  const [copied, setCopied] = useState(false);
  const isHighQuality = rewrittenQuestion === HIGH_QUALITY_SENTINEL;

  async function handleCopy() {
    await navigator.clipboard.writeText(rewrittenQuestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <h3 className="font-semibold text-indigo-900">リライト後の質問</h3>
      {isHighQuality ? (
        <p className="mt-2 text-sm text-green-700">✅ 十分良い質問です。このままAIに投稿できます。</p>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{rewrittenQuestion}</p>
          <button
            onClick={handleCopy}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            {copied ? '✅ コピーしました' : 'コピー'}
          </button>
        </>
      )}
    </div>
  );
}
