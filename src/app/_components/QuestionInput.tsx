'use client';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const MAX_LENGTH = 1000;

export function QuestionInput({ value, onChange, onSubmit, isLoading }: QuestionInputProps) {
  const remaining = MAX_LENGTH - value.length;
  const isOverLimit = value.length > MAX_LENGTH;
  const isEmpty = value.trim().length === 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isEmpty && !isOverLimit && !isLoading) {
        onSubmit(value);
      }
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="評価したい質問を入力してください..."
        rows={5}
        className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
          {isOverLimit ? `${Math.abs(remaining)}文字オーバー` : `残り ${remaining} 文字`}
        </span>
        <button
          onClick={() => onSubmit(value)}
          disabled={isEmpty || isOverLimit || isLoading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '評価中...' : '評価する (Ctrl+Enter)'}
        </button>
      </div>
    </div>
  );
}
