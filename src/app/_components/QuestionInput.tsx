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
      <div>
        <label className="block text-sm font-medium text-slate-300">
          評価したい質問を入力してください
        </label>
        <p className="mt-1 text-xs text-slate-400">6つの観点で0〜100点をAIがスコアリングします</p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="例: Pythonでリストをソートするには？"
        rows={8}
        className="w-full rounded-lg border border-slate-600 bg-slate-700 p-4 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-slate-500'}`}>
          {isOverLimit ? `${Math.abs(remaining)}文字オーバー` : `残り ${remaining} 文字`}
        </span>
        <button
          onClick={() => onSubmit(value)}
          disabled={isEmpty || isOverLimit || isLoading}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isLoading ? '評価中...' : '評価する (Ctrl+Enter)'}
        </button>
      </div>
    </div>
  );
}
