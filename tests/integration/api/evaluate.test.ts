import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { EvaluationResult, ErrorResponse } from '@/lib/types/evaluation';

const mockEvaluate = vi.fn<(question: string) => Promise<EvaluationResult>>();

vi.mock('@/lib/services/EvaluationService', () => {
  class ClaudeApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ClaudeApiError';
    }
  }
  return {
    ClaudeApiError,
    EvaluationService: class {
      evaluate(question: string) {
        return mockEvaluate(question);
      }
    },
  };
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_RESULT: EvaluationResult = {
  originalQuestion: 'TypeScriptでasync/awaitのエラーハンドリングを教えてください',
  scores: {
    specificity: { score: 80, reason: '具体的です', feedback: '' },
    context: { score: 75, reason: '前提情報があります', feedback: '前提情報を追加するとより良い' },
    clarity: { score: 85, reason: '明確です', feedback: '' },
    answerability: { score: 70, reason: '回答しやすい', feedback: '範囲を絞ると良い' },
    total: 78,
  },
  overallFeedback: '全体的に良い質問です',
  rewrittenQuestion: 'TypeScriptでasync/awaitを使用する際、エラーハンドリングのベストプラクティスを教えてください',
};

describe('POST /api/evaluate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  it('正常系: 有効な質問 → EvaluationResult を返す', async () => {
    mockEvaluate.mockResolvedValue(VALID_RESULT);

    const { POST } = await import('@/app/api/evaluate/route');
    const req = makeRequest({ question: 'TypeScriptでasync/awaitのエラーハンドリングを教えてください' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = (await res.json()) as EvaluationResult;
    expect(data.scores.total).toBe(78);
    expect(data.overallFeedback).toBe('全体的に良い質問です');
  });

  it('バリデーションエラー: 空文字 → 400 VALIDATION_ERROR', async () => {
    const { POST } = await import('@/app/api/evaluate/route');
    const req = makeRequest({ question: '' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('バリデーションエラー: 1001文字 → 400 VALIDATION_ERROR', async () => {
    const { POST } = await import('@/app/api/evaluate/route');
    const req = makeRequest({ question: 'a'.repeat(1001) });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('APIエラー: Claude API がエラー → 502 API_ERROR', async () => {
    const { ClaudeApiError } = await import('@/lib/services/EvaluationService');
    mockEvaluate.mockRejectedValue(new ClaudeApiError('API呼び出しに失敗しました'));

    const { POST } = await import('@/app/api/evaluate/route');
    const req = makeRequest({ question: 'TypeScriptのエラーハンドリングを教えてください' });
    const res = await POST(req);

    expect(res.status).toBe(502);
    const data = (await res.json()) as ErrorResponse;
    expect(data.code).toBe('API_ERROR');
  });
});
