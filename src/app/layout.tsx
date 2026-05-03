import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuestionCoach - 質問力を高めるAI評価ツール',
  description: 'AIがあなたの質問を評価し、改善提案とリライトを行います',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
