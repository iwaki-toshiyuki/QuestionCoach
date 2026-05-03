export interface DimensionScore {
  score: number;
  reason: string;
  feedback: string;
}

export interface EvaluationResult {
  originalQuestion: string;
  scores: {
    specificity: DimensionScore;
    context: DimensionScore;
    clarity: DimensionScore;
    answerability: DimensionScore;
    total: number;
  };
  overallFeedback: string;
  rewrittenQuestion: string;
}

export interface EvaluationRequest {
  question: string;
}

export interface ErrorResponse {
  error: string;
  code: 'VALIDATION_ERROR' | 'API_ERROR' | 'TIMEOUT';
}

export const HIGH_QUALITY_SENTINEL = '__HIGH_QUALITY__';
