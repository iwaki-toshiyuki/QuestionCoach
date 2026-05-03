import Anthropic from '@anthropic-ai/sdk';
import type { EvaluationResult } from '@/lib/types/evaluation';
import { HIGH_QUALITY_SENTINEL } from '@/lib/types/evaluation';

export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

const PROMPT_TEMPLATE = `以下の質問を4つの観点で0〜100点の整数でスコアリングし、指定のJSON形式のみで返してください。

# 評価する質問
[QUESTION_PLACEHOLDER]

# 評価観点
- specificity: 具体性（どれくらい具体的か）
- context: 前提情報（状況説明が含まれているか）
- clarity: 目的の明確さ（何を達成したいかが伝わるか）
- answerability: 回答可能性（第三者が答えやすいか）

# 出力フォーマット（JSONのみ、説明文は不要）
{
  "specificity": { "score": <0-100>, "reason": "<1-2文>", "feedback": "<1-3文 or 空文字>" },
  "context":     { "score": <0-100>, "reason": "<1-2文>", "feedback": "<1-3文 or 空文字>" },
  "clarity":     { "score": <0-100>, "reason": "<1-2文>", "feedback": "<1-3文 or 空文字>" },
  "answerability":{ "score": <0-100>, "reason": "<1-2文>", "feedback": "<1-3文 or 空文字>" },
  "overallFeedback": "<1-2文>",
  "rewrittenQuestion": "<リライト後の質問 or __HIGH_QUALITY__>"
}

# ルール
- scoreが80以上の観点はfeedbackを空文字にする
- 4観点の平均が90以上の場合はrewrittenQuestionを"__HIGH_QUALITY__"にする
- JSON以外のテキストは出力しない`;

export function calcTotal(scores: EvaluationResult['scores']): number {
  const { specificity, context, clarity, answerability } = scores;
  return Math.round(
    (specificity.score + context.score + clarity.score + answerability.score) /
      4,
  );
}

export class EvaluationService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new ClaudeApiError('ANTHROPIC_API_KEY が設定されていません');
    }
    this.client = new Anthropic({ apiKey });
  }

  async evaluate(question: string): Promise<EvaluationResult> {
    const prompt = PROMPT_TEMPLATE.replace('[QUESTION_PLACEHOLDER]', question);

    let responseText: string;
    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = message.content[0];
      if (block.type !== 'text') {
        throw new ClaudeApiError('予期しないレスポンス形式です');
      }
      responseText = block.text;
    } catch (err) {
      if (err instanceof ClaudeApiError) throw err;
      throw new ClaudeApiError('Claude API の呼び出しに失敗しました', err as Error);
    }

    let parsed: Record<string, unknown>;
    try {
      const jsonStr = responseText
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
      parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch {
      throw new ClaudeApiError('レスポンスの JSON パースに失敗しました');
    }

    const scores = {
      specificity: parsed.specificity as EvaluationResult['scores']['specificity'],
      context: parsed.context as EvaluationResult['scores']['context'],
      clarity: parsed.clarity as EvaluationResult['scores']['clarity'],
      answerability: parsed.answerability as EvaluationResult['scores']['answerability'],
      total: 0,
    };
    scores.total = calcTotal(scores);

    return {
      originalQuestion: question,
      scores,
      overallFeedback: parsed.overallFeedback as string,
      rewrittenQuestion: (parsed.rewrittenQuestion as string) ?? HIGH_QUALITY_SENTINEL,
    };
  }
}
