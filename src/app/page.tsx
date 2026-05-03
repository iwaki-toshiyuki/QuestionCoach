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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">QuestionCoach</h1>
        <p className="mt-2 text-gray-500">質問力を高めるAI評価ツール</p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <QuestionInput
          value={question}
          onChange={handleQuestionChange}
          onSubmit={handleSubmit}
          isLoading={state === 'loading'}
        />
      </section>

      {state === 'loading' && (
        <div className="mt-8 flex items-center justify-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>AIが評価中です...</span>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{errorMessage}</p>
          <button
            onClick={() => handleSubmit(question)}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      )}

      {state === 'results' && result && (
        <div className="mt-8 space-y-6">
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
  );
}
