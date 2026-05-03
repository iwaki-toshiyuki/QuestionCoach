import { NextRequest, NextResponse } from 'next/server';
import { validateQuestion, ValidationError } from '@/lib/validators/question';
import { EvaluationService, ClaudeApiError } from '@/lib/services/EvaluationService';
import type { ErrorResponse } from '@/lib/types/evaluation';

const TIMEOUT_MS = 30_000;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let question: string;
  try {
    const body = (await req.json()) as { question?: unknown };
    question = typeof body.question === 'string' ? body.question : '';
  } catch {
    return NextResponse.json<ErrorResponse>(
      { error: '不正なリクエストです', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  try {
    validateQuestion(question);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json<ErrorResponse>(
        { error: err.message, code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    throw err;
  }

  const service = new EvaluationService();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS),
  );

  try {
    const result = await Promise.race([service.evaluate(question), timeoutPromise]);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return NextResponse.json<ErrorResponse>(
        { error: '応答がタイムアウトしました。再試行してください', code: 'TIMEOUT' },
        { status: 504 },
      );
    }
    if (err instanceof ClaudeApiError) {
      return NextResponse.json<ErrorResponse>(
        { error: '評価に失敗しました。もう一度お試しください', code: 'API_ERROR' },
        { status: 502 },
      );
    }
    return NextResponse.json<ErrorResponse>(
      { error: '予期しないエラーが発生しました', code: 'API_ERROR' },
      { status: 502 },
    );
  }
}
