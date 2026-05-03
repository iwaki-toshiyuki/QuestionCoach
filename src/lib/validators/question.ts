export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateQuestion(question: string): void {
  if (!question || question.trim().length === 0) {
    throw new ValidationError('質問を入力してください', 'question');
  }
  if (question.length > 1000) {
    throw new ValidationError(
      `1000文字以内で入力してください（現在: ${question.length}文字）`,
      'question',
    );
  }
}
