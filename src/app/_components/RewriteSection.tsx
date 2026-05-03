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
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold text-blue-800">リライト後の質問</h3>
      {isHighQuality ? (
        <p className="mt-2 text-green-700">✅ 十分良い質問です。このままAIに投稿できます。</p>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{rewrittenQuestion}</p>
          <button
            onClick={handleCopy}
            className="mt-3 rounded-md border border-blue-300 bg-white px-4 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
          >
            {copied ? '✅ コピーしました' : 'コピー'}
          </button>
        </>
      )}
    </div>
  );
}
