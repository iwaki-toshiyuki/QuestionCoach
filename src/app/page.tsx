'use client';

import { useState, useEffect } from 'react';
import { QuestionInput } from './_components/QuestionInput';
import { ScoreDisplay } from './_components/ScoreDisplay';
import { FeedbackSection } from './_components/FeedbackSection';
import { RewriteSection } from './_components/RewriteSection';
import { BeforeAfterComparison } from './_components/BeforeAfterComparison';
import type { EvaluationResult, ErrorResponse } from '@/lib/types/evaluation';

type EvaluationState = 'idle' | 'loading' | 'results' | 'error';

const STORAGE_KEY = 'qc_question_draft';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<EvaluationState>('idle');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setQuestion(saved);
  }, []);

  function handleQuestionChange(value: string) {
    setQuestion(value);
    localStorage.setItem(STORAGE_KEY, value);
  }

  async function handleSubmit(q: string) {
    setState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      const data = (await res.json()) as EvaluationResult | ErrorResponse;

      if (!res.ok) {
        const err = data as ErrorResponse;
        setErrorMessage(err.error ?? '評価に失敗しました');
        setState('error');
        return;
      }

      setResult(data as EvaluationResult);
      setState('results');
    } catch {
      setErrorMessage('ネットワークエラーが発生しました。再試行してください');
      setState('error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
      {/* 左パネル: 入力エリア */}
      <aside className="w-full md:w-1/3 bg-slate-800 md:sticky md:top-0 md:h-screen flex flex-col p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">QuestionCoach</h1>
          <p className="mt-1 text-sm text-slate-400">質問力を高めるAI評価ツール</p>
        </div>

        <div className="flex-1">
          <QuestionInput
            value={question}
            onChange={handleQuestionChange}
            onSubmit={handleSubmit}
            isLoading={state === 'loading'}
          />
        </div>

        {state === 'loading' && (
          <div className="mt-6 flex items-center gap-3 text-slate-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">AIが評価中です...</span>
          </div>
        )}

        {state === 'error' && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-900/20 p-4">
            <p className="text-sm text-red-300">{errorMessage}</p>
            <button
              onClick={() => handleSubmit(question)}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
            >
              再試行
            </button>
          </div>
        )}
      </aside>

      {/* 右パネル: 結果エリア */}
      <main className="w-full md:w-2/3 p-8">
        {state === 'idle' && (
          <div className="flex h-full min-h-64 items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-4xl mb-3">✏️</p>
              <p className="text-sm">左の入力エリアに質問を入力して</p>
              <p className="text-sm">「評価する」を押してください</p>
            </div>
          </div>
        )}

        {state === 'results' && result && (
          <div className="space-y-6">
            <ScoreDisplay scores={result.scores} />
            <FeedbackSection scores={result.scores} overallFeedback={result.overallFeedback} />
            <RewriteSection rewrittenQuestion={result.rewrittenQuestion} />
            <BeforeAfterComparison
              originalQuestion={result.originalQuestion}
              totalScore={result.scores.total}
              rewrittenQuestion={result.rewrittenQuestion}
            />
          </div>
        )}
      </main>
    </div>
  );
}
